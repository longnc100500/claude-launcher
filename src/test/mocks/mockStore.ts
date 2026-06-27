import type { AppStoreSchema } from '../../repositories/appStore'

type StoreData = AppStoreSchema

// Minimal interface that ProfileRepository actually uses
export interface MockableStore {
  get<K extends keyof StoreData>(key: K, defaultValue: StoreData[K]): StoreData[K]
  set<K extends keyof StoreData>(key: K, value: StoreData[K]): void
  set(key: string, value: unknown): void
}

export class MockStore implements MockableStore {
  private data: StoreData = {
    profiles: {},
  }

  get<K extends keyof StoreData>(key: K, defaultValue: StoreData[K]): StoreData[K] {
    const value = this.data[key]
    return value !== undefined ? value : defaultValue
  }

  set<K extends keyof StoreData>(key: K, value: StoreData[K]): void
  set(key: string, value: unknown): void
  set(key: string, value: unknown): void {
    // Handle dot-notation keys like "profiles.some-id"
    const parts = key.split('.')
    if (parts.length === 1) {
      ;(this.data as unknown as Record<string, unknown>)[key] = value
    } else {
      const [root, ...rest] = parts
      const nested = (this.data as unknown as Record<string, Record<string, unknown>>)[root ?? ''] ?? {}
      const nestedKey = rest.join('.')
      nested[nestedKey] = value
      ;(this.data as unknown as Record<string, unknown>)[root ?? ''] = nested
    }
  }

  reset(): void {
    this.data = { profiles: {} }
  }
}
