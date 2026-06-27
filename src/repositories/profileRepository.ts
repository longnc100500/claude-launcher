import type { Profile, ProfileId, IProfileRepository } from '../domain/profile'
import { createProfileId } from '../domain/profile'
import type { AppStore, StoredProfile } from './appStore'

export class ProfileRepository implements IProfileRepository {
  constructor(private readonly store: AppStore) {}

  async findAll(): Promise<ReadonlyArray<Profile>> {
    const profiles = this.store.get('profiles', {})
    return Object.values(profiles)
      .map(deserialize)
      .sort((a, b) => {
        const aTime = a.lastUsedAt?.getTime() ?? a.createdAt.getTime()
        const bTime = b.lastUsedAt?.getTime() ?? b.createdAt.getTime()
        return bTime - aTime
      })
  }

  async findById(id: ProfileId): Promise<Profile | null> {
    const profiles = this.store.get('profiles', {})
    const stored = profiles[id]
    return stored !== undefined ? deserialize(stored) : null
  }

  async save(profile: Profile): Promise<void> {
    const key = `profiles.${profile.id}` as const
    this.store.set(key, serialize(profile))
  }

  async delete(id: ProfileId): Promise<void> {
    const profiles = this.store.get('profiles', {})
    const updated = { ...profiles }
    delete updated[id]
    this.store.set('profiles', updated)
  }

  async exists(id: ProfileId): Promise<boolean> {
    const profiles = this.store.get('profiles', {})
    return id in profiles
  }
}

function serialize(profile: Profile): StoredProfile {
  return {
    id: profile.id,
    name: profile.name,
    homeDir: profile.homeDir,
    createdAt: profile.createdAt.toISOString(),
    lastUsedAt: profile.lastUsedAt?.toISOString() ?? null,
    color: profile.color,
    icon: profile.icon,
  }
}

function deserialize(stored: StoredProfile): Profile {
  return {
    id: createProfileId(stored.id),
    name: stored.name,
    homeDir: stored.homeDir,
    createdAt: new Date(stored.createdAt),
    lastUsedAt: stored.lastUsedAt !== null ? new Date(stored.lastUsedAt) : null,
    color: stored.color,
    icon: stored.icon,
  }
}
