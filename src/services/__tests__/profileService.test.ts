import { describe, it, expect, beforeEach } from 'vitest'
import { ProfileService } from '../profileService'
import { MockFilesystemService } from '../../test/mocks/mockFilesystemService'
import { MockStore } from '../../test/mocks/mockStore'
import { ProfileRepository } from '../../repositories/profileRepository'
import { createProfileId } from '../../domain/profile'
import type { Profile } from '../../domain/profile'

const BASE_DIR = '/home/profiles'

function makeRepo(store: MockStore): ProfileRepository {
  return new ProfileRepository(store as never)
}

function makeService(
  fs: MockFilesystemService,
  store: MockStore,
): ProfileService {
  return new ProfileService(makeRepo(store), fs, { profilesBaseDir: BASE_DIR })
}

async function createTestProfile(
  service: ProfileService,
  name = 'Work',
): Promise<Profile> {
  const result = await service.createProfile({ name })
  if (!result.ok) throw new Error(`Failed to create test profile: ${result.error.message}`)
  return result.value
}

describe('ProfileService', () => {
  let fs: MockFilesystemService
  let store: MockStore
  let service: ProfileService

  beforeEach(() => {
    fs = new MockFilesystemService()
    store = new MockStore()
    service = makeService(fs, store)
  })

  describe('createProfile', () => {
    it('creates a profile and returns it', async () => {
      const result = await service.createProfile({ name: 'Work' })
      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value.name).toBe('Work')
        expect(result.value.homeDir).toContain(BASE_DIR)
      }
    })

    it('creates the home directory on disk', async () => {
      const result = await service.createProfile({ name: 'Work' })
      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(await fs.exists(result.value.homeDir)).toBe(true)
      }
    })

    it('returns error for an empty name', async () => {
      const result = await service.createProfile({ name: '' })
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error.code).toBe('PROFILE_VALIDATION_ERROR')
      }
    })

    it('returns error for a name longer than 64 characters', async () => {
      const result = await service.createProfile({ name: 'a'.repeat(65) })
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error.code).toBe('PROFILE_VALIDATION_ERROR')
      }
    })

    it('returns error when a profile with the same name already exists', async () => {
      await createTestProfile(service, 'Work')
      const result = await service.createProfile({ name: 'Work' })
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error.code).toBe('PROFILE_ALREADY_EXISTS')
      }
    })

    it('trims whitespace from the name', async () => {
      const result = await service.createProfile({ name: '  Work  ' })
      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value.name).toBe('Work')
      }
    })

    it('stores color and icon when provided', async () => {
      const result = await service.createProfile({
        name: 'Work',
        color: '#ff0000',
        icon: '💼',
      })
      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value.color).toBe('#ff0000')
        expect(result.value.icon).toBe('💼')
      }
    })
  })

  describe('deleteProfile', () => {
    it('deletes an existing profile', async () => {
      const profile = await createTestProfile(service)
      const result = await service.deleteProfile(profile.id)
      expect(result.ok).toBe(true)
    })

    it('removes the home directory', async () => {
      const profile = await createTestProfile(service)
      const homeDir = profile.homeDir
      await service.deleteProfile(profile.id)
      expect(await fs.exists(homeDir)).toBe(false)
    })

    it('returns error when profile not found', async () => {
      const result = await service.deleteProfile(
        createProfileId('550e8400-e29b-41d4-a716-446655440099'),
      )
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error.code).toBe('PROFILE_NOT_FOUND')
      }
    })
  })

  describe('updateProfile', () => {
    it('updates the profile name', async () => {
      const profile = await createTestProfile(service, 'Work')
      const result = await service.updateProfile(profile.id, { name: 'Personal' })
      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value.name).toBe('Personal')
      }
    })

    it('returns error when profile not found', async () => {
      const result = await service.updateProfile(
        createProfileId('550e8400-e29b-41d4-a716-446655440099'),
        { name: 'New' },
      )
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error.code).toBe('PROFILE_NOT_FOUND')
      }
    })

    it('returns error when new name is already taken by another profile', async () => {
      await createTestProfile(service, 'Work')
      const personal = await createTestProfile(service, 'Personal')
      const result = await service.updateProfile(personal.id, { name: 'Work' })
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error.code).toBe('PROFILE_ALREADY_EXISTS')
      }
    })

    it('allows updating to the same name (no-op)', async () => {
      const profile = await createTestProfile(service, 'Work')
      const result = await service.updateProfile(profile.id, { name: 'Work' })
      expect(result.ok).toBe(true)
    })
  })

  describe('listProfiles', () => {
    it('returns an empty list when there are no profiles', async () => {
      const result = await service.listProfiles()
      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value).toHaveLength(0)
      }
    })

    it('returns all profiles', async () => {
      await createTestProfile(service, 'Work')
      await createTestProfile(service, 'Personal')
      const result = await service.listProfiles()
      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value).toHaveLength(2)
      }
    })
  })

  describe('getProfile', () => {
    it('returns the profile when found', async () => {
      const profile = await createTestProfile(service, 'Work')
      const result = await service.getProfile(profile.id)
      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value.name).toBe('Work')
      }
    })

    it('returns error when not found', async () => {
      const result = await service.getProfile(
        createProfileId('550e8400-e29b-41d4-a716-446655440099'),
      )
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error.code).toBe('PROFILE_NOT_FOUND')
      }
    })
  })

  describe('recordProfileUsage', () => {
    it('updates lastUsedAt for the profile', async () => {
      const profile = await createTestProfile(service)
      expect(profile.lastUsedAt).toBeNull()
      await service.recordProfileUsage(profile.id)
      const updated = await service.getProfile(profile.id)
      expect(updated.ok).toBe(true)
      if (updated.ok) {
        expect(updated.value.lastUsedAt).not.toBeNull()
      }
    })

    it('returns error when profile not found', async () => {
      const result = await service.recordProfileUsage(
        createProfileId('550e8400-e29b-41d4-a716-446655440099'),
      )
      expect(result.ok).toBe(false)
    })
  })
})
