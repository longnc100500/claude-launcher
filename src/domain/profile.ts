declare const __profileId: unique symbol

export type ProfileId = string & { readonly [__profileId]: true }

export function createProfileId(id: string): ProfileId {
  return id as ProfileId
}

export interface Profile {
  readonly id: ProfileId
  readonly name: string
  readonly homeDir: string
  readonly createdAt: Date
  readonly lastUsedAt: Date | null
  readonly color: string | null
  readonly icon: string | null
}

export interface CreateProfileInput {
  readonly name: string
  readonly color?: string | undefined
  readonly icon?: string | undefined
}

export interface UpdateProfileInput {
  readonly name?: string | undefined
  readonly color?: string | undefined
  readonly icon?: string | undefined
}

export interface IProfileRepository {
  findAll(): Promise<ReadonlyArray<Profile>>
  findById(id: ProfileId): Promise<Profile | null>
  save(profile: Profile): Promise<void>
  delete(id: ProfileId): Promise<void>
  exists(id: ProfileId): Promise<boolean>
}
