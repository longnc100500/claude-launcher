export interface AppSettings {
  readonly claudeBinaryPath: string | null
  readonly dataDir: string
  readonly launchOnStartup: boolean
}

export interface ISettingsRepository {
  get(): Promise<AppSettings>
  save(settings: AppSettings): Promise<void>
}
