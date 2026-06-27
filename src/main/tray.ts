import { Tray, Menu, app, BrowserWindow } from 'electron'
import { join } from 'path'

let tray: Tray | null = null

export function createTray(getMainWindow: () => BrowserWindow | null): void {
  // Use a simple 16x16 blank icon — replace with real asset later
  const iconPath = join(__dirname, '../../resources/tray-icon.png')

  try {
    tray = new Tray(iconPath)
  } catch {
    // If icon not found, skip tray creation (dev/CI environment)
    return
  }

  tray.setToolTip('Claude Launcher')

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open Claude Launcher',
      click: () => {
        const win = getMainWindow()
        if (win) {
          win.show()
          win.focus()
        }
      },
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.quit()
      },
    },
  ])

  tray.setContextMenu(contextMenu)

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
