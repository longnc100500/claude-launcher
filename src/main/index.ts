import { app, ipcMain, BrowserWindow } from 'electron'
import { createWindow } from './window'
import { createAppStore, DEFAULT_SETTINGS } from '../repositories/appStore'
import { ProfileRepository } from '../repositories/profileRepository'
import { SettingsRepository } from '../repositories/settingsRepository'
import { FilesystemService } from '../services/filesystemService'
import { ProfileService } from '../services/profileService'
import { LaunchService } from '../services/launchService'
import { registerProfileHandlers } from './ipc/profileHandlers'
import { registerSettingsHandlers } from './ipc/settingsHandlers'
import { registerLaunchHandlers } from './ipc/launchHandlers'
import type { ProfileId } from '../domain/profile'

let _mainWindow: BrowserWindow | null = null

app.whenReady().then(() => {
  const userData = app.getPath('userData')
  const store = createAppStore()

  // Seed data directory into settings if not set
  const currentSettings = store.get('settings', DEFAULT_SETTINGS)
  if (!currentSettings.dataDir) {
    store.set('settings', { ...currentSettings, dataDir: userData })
  }

  // Repositories
  const profileRepo = new ProfileRepository(store)
  const settingsRepo = new SettingsRepository(store)

  // Services
  const fs = new FilesystemService()
  const profileService = new ProfileService(profileRepo, fs, {
    profilesBaseDir: `${userData}/profiles`,
  })
  const launchService = new LaunchService(profileService, fs)

  // Register IPC handlers
  registerProfileHandlers(ipcMain, profileService)
  registerSettingsHandlers(ipcMain, settingsRepo)
  registerLaunchHandlers(ipcMain, launchService, settingsRepo)

  // Create main window
  _mainWindow = createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      _mainWindow = createWindow()
    }
  })

  // Gracefully stop all running profiles on quit
  app.on('before-quit', () => {
    for (const [profileId] of launchService.getAllStatuses()) {
      launchService.stop(profileId as ProfileId)
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
