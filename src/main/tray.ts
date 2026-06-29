import { Tray, Menu, app, BrowserWindow } from 'electron'
import { join } from 'path'
import { spawn as spawnProcess } from 'child_process'
import type { LaunchService } from '../services/launchService'
import type { ProfileService } from '../services/profileService'

let tray: Tray | null = null
let _getMainWindow: (() => BrowserWindow | null) | null = null
let _launchService: LaunchService | null = null
let _profileService: ProfileService | null = null

function focusByPid(pid: number): void {
  if (process.platform === 'darwin') {
    spawnProcess('osascript', [
      '-e',
      `tell application "System Events" to set frontmost of (first process whose unix id is ${pid}) to true`,
    ])
  }
}

export async function rebuildTrayMenu(): Promise<void> {
  if (!tray || !_launchService || !_profileService || !_getMainWindow) return

  const statuses = _launchService.getAllStatuses()
  const runningItems: Electron.MenuItemConstructorOptions[] = []

  for (const [profileId, status] of statuses) {
    if (status.status !== 'running') continue
    const result = await _profileService.getProfile(profileId as never)
    if (!result.ok) continue
    const { name, icon } = result.value
    const pid = status.pid
    runningItems.push({
      label: `${icon ?? '●'} ${name}`,
      click: () => focusByPid(pid),
    })
  }

  const template: Electron.MenuItemConstructorOptions[] = []

  if (runningItems.length > 0) {
    template.push(...runningItems)
    template.push({ type: 'separator' })
  }

  template.push(
    {
      label: 'Open Claude Desktop Profiles',
      click: () => {
        const win = _getMainWindow?.()
        if (win) {
          win.show()
          win.focus()
        }
      },
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => app.quit(),
    },
  )

  tray.setContextMenu(Menu.buildFromTemplate(template))
}

export function createTray(
  getMainWindow: () => BrowserWindow | null,
  launchService: LaunchService,
  profileService: ProfileService,
): void {
  _getMainWindow = getMainWindow
  _launchService = launchService
  _profileService = profileService

  const iconPath = join(__dirname, '../../resources/tray-icon.png')

  try {
    tray = new Tray(iconPath)
  } catch {
    // If icon not found, skip tray creation (dev/CI environment)
    return
  }

  tray.setToolTip('Claude Desktop Profiles')

  void rebuildTrayMenu()

  tray.on('click', () => {
    const win = getMainWindow()
    if (win) {
      if (win.isVisible()) {
        win.hide()
      } else {
        win.show()
        win.focus()
      }
    }
  })
}

export function destroyTray(): void {
  tray?.destroy()
  tray = null
}
