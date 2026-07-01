import { app, ipcMain, BrowserWindow } from 'electron'
import { spawn } from 'child_process'
import { createWindow } from './window'
import { createTray, rebuildTrayMenu } from './tray'
import { createAppStore, DEFAULT_SETTINGS } from '../repositories/appStore'
import { ProfileRepository } from '../repositories/profileRepository'
import { SettingsRepository } from '../repositories/settingsRepository'
import { FilesystemService } from '../services/filesystemService'
import { ProfileService } from '../services/profileService'
import { LaunchService } from '../services/launchService'
import { registerProfileHandlers } from './ipc/profileHandlers'
import { registerSettingsHandlers } from './ipc/settingsHandlers'
import { registerLaunchHandlers } from './ipc/launchHandlers'
import { SessionSyncService } from '../services/sessionSyncService'
import { registerSessionHandlers } from './ipc/sessionHandlers'
import { IPC_CHANNELS } from '../shared/ipc/channels'
import type { ProfileId } from '../domain/profile'

// Register as claude:// protocol handler so OAuth callbacks route here
// instead of launching a fresh Claude Desktop without --user-data-dir.
app.setAsDefaultProtocolClient('claude')

let _forwardCtx: {
  launchService: LaunchService
  profileService: ProfileService
  settingsRepo: SettingsRepository
} | null = null

// Buffer a URL that arrives before app is ready (cold launch via URL scheme)
let _pendingUrl: string | null = null

function forwardProtocolUrl(url: string): void {
  if (!_forwardCtx) {
    _pendingUrl = url
    return
  }
  const { launchService, profileService, settingsRepo } = _forwardCtx
  void (async () => {
    const settings = await settingsRepo.get()
    if (!settings.claudeBinaryPath) return

    // Forward the URL to every running profile instance.
    // Spawning with the same --user-data-dir triggers Electron's
    // requestSingleInstanceLock in the running Claude Desktop — the URL
    // is delivered via second-instance without opening a new window.
    for (const [profileId] of launchService.getAllStatuses()) {
      const result = await profileService.getProfile(profileId as ProfileId)
      if (!result.ok) continue
      const userDataDir = `${result.value.homeDir}/user-data`
      spawn(settings.claudeBinaryPath, [`--user-data-dir=${userDataDir}`, url], {
        detached: true,
        stdio: 'ignore',
      }).unref()
    }
  })()
}

// macOS: URL arrives via open-url when app is already running
app.on('open-url', (event, url) => {
  event.preventDefault()
  forwardProtocolUrl(url)
})

// Windows/Linux: URL is a command-line argument on second-instance launch
app.on('second-instance', (_event, argv) => {
  const url = argv.find((arg) => arg.startsWith('claude://'))
  if (url) forwardProtocolUrl(url)
})

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
  const sessionSyncService = new SessionSyncService(profileRepo, fs)

  _forwardCtx = { launchService, profileService, settingsRepo }

  // Process any URL that arrived before the app was ready
  if (_pendingUrl) {
    forwardProtocolUrl(_pendingUrl)
    _pendingUrl = null
  }

  // Register IPC handlers
  registerProfileHandlers(ipcMain, profileService)
  registerSettingsHandlers(ipcMain, settingsRepo)
  registerLaunchHandlers(ipcMain, launchService, settingsRepo)
  registerSessionHandlers(ipcMain, sessionSyncService)

  // Push process exit notifications to renderer and rebuild tray
  launchService.onProcessExit((profileId) => {
    for (const win of BrowserWindow.getAllWindows()) {
      win.webContents.send(IPC_CHANNELS.LAUNCHER_STATUS_CHANGED, { profileId, status: 'stopped' })
    }
    void rebuildTrayMenu()
  })

  // Create main window
  _mainWindow = createWindow()
  createTray(() => _mainWindow, launchService, profileService)

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
