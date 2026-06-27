import { app, BrowserWindow } from 'electron'
import { createWindow } from './window'

let _mainWindow: BrowserWindow | null = null

app.whenReady().then(() => {
  _mainWindow = createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      _mainWindow = createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
