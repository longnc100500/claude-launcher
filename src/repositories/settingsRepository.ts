import type { AppSettings, ISettingsRepository } from '../domain/settings'
import type { AppStore } from './appStore'
import { DEFAULT_SETTINGS } from './appStore'

export class SettingsRepository implements ISettingsRepository {
  constructor(private readonly store: AppStore) {}

  async get(): Promise<AppSettings> {
    const stored = this.store.get('settings', DEFAULT_SETTINGS)
    return {
      claudeBinaryPath: stored.claudeBinaryPath,
      dataDir: stored.dataDir,
      launchOnStartup: stored.launchOnStartup,
    }
  }

  async save(settings: AppSettings): Promise<void> {
    this.store.set('settings', {
      claudeBinaryPath: settings.claudeBinaryPath,
      dataDir: settings.dataDir,
      launchOnStartup: settings.launchOnStartup,
    })
  }
}
