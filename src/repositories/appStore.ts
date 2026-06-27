import Store from 'electron-store'
import type { ProfileId } from '../domain/profile'

// Serialized profile as stored on disk (Dates become strings)
export interface StoredProfile {
  readonly id: string
  readonly name: string
  readonly homeDir: string
  readonly createdAt: string
  readonly lastUsedAt: string | null
  readonly color: string | null
  readonly icon: string | null
}

export interface AppStoreSchema {
  profiles: Record<string, StoredProfile>
}

export type AppStore = Store<AppStoreSchema>

export function createAppStore(): AppStore {
  return new Store<AppStoreSchema>({
    name: 'claude-launcher',
    defaults: {
      profiles: {},
    },
  })
}

export function profileKey(id: ProfileId): string {
  return `profiles.${id}`
}
