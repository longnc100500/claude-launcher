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

export interface AppSettingsStored {
  claudeBinaryPath: string | null
  dataDir: string
  launchOnStartup: boolean
}

export const DEFAULT_SETTINGS: AppSettingsStored = {
  claudeBinaryPath: null,
  dataDir: '',
  launchOnStartup: false,
}

export interface AppStoreSchema {
  profiles: Record<string, StoredProfile>
  settings: AppSettingsStored
}

export type AppStore = Store<AppStoreSchema>

export function createAppStore(): AppStore {
  return new Store<AppStoreSchema>({
    name: 'claude-desktop-profiles',
    defaults: {
      profiles: {},
      settings: DEFAULT_SETTINGS,
    },
  })
}

export function profileKey(id: ProfileId): string {
  return `profiles.${id}`
}
