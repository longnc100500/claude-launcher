import type { Profile, ProfileId, IProfileRepository, CreateProfileInput, UpdateProfileInput } from '../domain/profile'
import { createProfileId } from '../domain/profile'
import type { IFilesystemService } from '../domain/filesystem'
import {
  ProfileNotFoundError,
  ProfileAlreadyExistsError,
  ProfileValidationError,
} from '../domain/errors'
import type { ProfileError } from '../domain/errors'
import type { Result } from '../shared/types/result'
import { Ok, Err } from '../shared/types/result'
import { generateId } from '../shared/utils/id'
import { joinPaths } from '../shared/utils/path'

export interface ProfileServiceConfig {
  readonly profilesBaseDir: string
}

export class ProfileService {
  constructor(
    private readonly repo: IProfileRepository,
    private readonly fs: IFilesystemService,
    private readonly config: ProfileServiceConfig,
  ) {}

  async createProfile(
    input: CreateProfileInput,
  ): Promise<Result<Profile, ProfileError>> {
    const validation = this.validateName(input.name)
    if (!validation.ok) return validation

    const existing = await this.repo.findAll()
    if (existing.some((p) => p.name === input.name.trim())) {
      return Err(new ProfileAlreadyExistsError(input.name))
    }

    const id = createProfileId(generateId())
    const homeDir = joinPaths(this.config.profilesBaseDir, id)

    try {
      await this.fs.mkdir(homeDir, { recursive: true })
    } catch (err) {
      return Err(
        new ProfileValidationError(
          `Failed to create home directory: ${err instanceof Error ? err.message : String(err)}`,
        ),
      )
    }

    const now = new Date()
    const profile: Profile = {
      id,
      name: input.name.trim(),
      homeDir,
      createdAt: now,
      lastUsedAt: null,
      color: input.color ?? null,
      icon: input.icon ?? null,
    }

    await this.repo.save(profile)
    return Ok(profile)
  }

  async deleteProfile(id: ProfileId): Promise<Result<void, ProfileError>> {
    const profile = await this.repo.findById(id)
    if (profile === null) {
      return Err(new ProfileNotFoundError(id))
    }

    try {
      await this.fs.rm(profile.homeDir, { recursive: true, force: true })
    } catch (err) {
      return Err(
        new ProfileValidationError(
          `Failed to remove home directory: ${err instanceof Error ? err.message : String(err)}`,
        ),
      )
    }

    await this.repo.delete(id)
    return Ok(undefined)
  }

  async updateProfile(
    id: ProfileId,
    input: UpdateProfileInput,
  ): Promise<Result<Profile, ProfileError>> {
    const profile = await this.repo.findById(id)
    if (profile === null) {
      return Err(new ProfileNotFoundError(id))
    }

    if (input.name !== undefined) {
      const inputName = input.name
      const validation = this.validateName(inputName)
      if (!validation.ok) return validation

      const existing = await this.repo.findAll()
      if (existing.some((p) => p.name === inputName.trim() && p.id !== id)) {
        return Err(new ProfileAlreadyExistsError(inputName))
      }
    }

    const updated: Profile = {
      ...profile,
      name: input.name?.trim() ?? profile.name,
      color: input.color !== undefined ? input.color : profile.color,
      icon: input.icon !== undefined ? input.icon : profile.icon,
    }

    await this.repo.save(updated)
    return Ok(updated)
  }

  async listProfiles(): Promise<Result<ReadonlyArray<Profile>, never>> {
    const profiles = await this.repo.findAll()
    return Ok(profiles)
  }

  async getProfile(id: ProfileId): Promise<Result<Profile, ProfileNotFoundError>> {
    const profile = await this.repo.findById(id)
    if (profile === null) {
      return Err(new ProfileNotFoundError(id))
    }
    return Ok(profile)
  }

  async recordProfileUsage(id: ProfileId): Promise<Result<void, ProfileNotFoundError>> {
    const profile = await this.repo.findById(id)
    if (profile === null) {
      return Err(new ProfileNotFoundError(id))
    }
    await this.repo.save({ ...profile, lastUsedAt: new Date() })
    return Ok(undefined)
  }

  private validateName(name: string): Result<void, ProfileValidationError> {
    const trimmed = name.trim()
    if (trimmed.length === 0) {
      return Err(new ProfileValidationError('Profile name cannot be empty'))
    }
    if (trimmed.length > 64) {
      return Err(new ProfileValidationError('Profile name must be 64 characters or fewer'))
    }
    return Ok(undefined)
  }
}
