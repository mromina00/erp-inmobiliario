import { app, BrowserWindow, ipcMain } from 'electron'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { registerHandlers } from './handlers.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

const isDev = !app.isPackaged

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      preload: join(__dirname, '../preload/index.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  if (isDev) {
    win.loadURL('http://localhost:5173')
    win.webContents.openDevTools()
  } else {
    win.loadFile(join(__dirname, '../../dist/index.html'))
  }
}

app.whenReady().then(() => {
  registerHandlers()
  createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})