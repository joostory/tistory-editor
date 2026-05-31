import { app, BrowserWindow, Menu, shell, dialog } from 'electron'
import * as settings from 'electron-settings'
import * as path from 'path'
import * as url from 'url'
import * as appInfo from '#/main/appInfo'
import { appState } from '#/main/appState'

let mainWindow: BrowserWindow | null = null

function setWindowEvent() {
  if (!mainWindow) return

  mainWindow.on("close", (e) => {
    if (appState.showExitPrompt) {
      e.preventDefault()
      dialog.showMessageBox({
        type: 'question',
        buttons: ['Yes', 'No'],
        title: 'Confirm',
        message: '지금 앱을 종료하면 저장하지 않는 내용이 사라집니다. 종료하시겠습니까?'
      }).then(result => {
        if (result.response === 0) {
          appState.showExitPrompt = false
          mainWindow?.close()
        }
      })
    }
    if (mainWindow) {
      settings.setSync('config', mainWindow.getBounds() as any)
    }
  })

  mainWindow.on('closed', function () {
    mainWindow = null
  })
}

function setWindowWebContents() {
  if (!mainWindow) return

  if (process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL, {
      userAgent: appInfo.userAgentFull
    })
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadURL(url.format({
      pathname: path.join(__dirname, '../renderer/index.html'),
      protocol: 'file:',
      slashes: true
    }), {
      userAgent: appInfo.userAgentFull
    })
  }

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if ((url.startsWith('http:') || url.startsWith('https:')) && 
        (!process.env.ELECTRON_RENDERER_URL || !url.startsWith(process.env.ELECTRON_RENDERER_URL)) &&
        !url.startsWith('http://localhost:5173')) {
      shell.openExternal(url)
    }
    return { action: 'deny' }
  })

  mainWindow.webContents.on('will-navigate', (e, url) => {
    if (!url.startsWith('file://') && 
        (!process.env.ELECTRON_RENDERER_URL || !url.startsWith(process.env.ELECTRON_RENDERER_URL)) &&
        !url.startsWith('http://localhost:5173')) {
      e.preventDefault()
      if (url.startsWith('http:') || url.startsWith('https:')) {
        shell.openExternal(url)
      }
    }
  })
}

function setWindowMenu() {
  if (!mainWindow) return

  mainWindow.setMenu(null)

  // Create the Application's main menu
  const template: any[] = [
    {
      label: "Application",
      submenu: [
        { label: "About", click() { appInfo.openWindow() }},
        { label: "Preferences...", accelerator: "CmdOrCtrl+,", click() { mainWindow?.webContents.send("open-preference") }},
        { type: "separator" },
        { label: "Quit", accelerator: "CmdOrCtrl+Q", click() { app.quit() }}
      ]
    },
    {
      label: "Edit",
      submenu: [
        { label: "Undo", accelerator: "CmdOrCtrl+Z", role: "undo" },
        { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", role: "redo" },
        { type: "separator" },
        { label: "Cut", accelerator: "CmdOrCtrl+X", role: "cut" },
        { label: "Copy", accelerator: "CmdOrCtrl+C", role: "copy" },
        { label: "Paste", accelerator: "CmdOrCtrl+V", role: "paste" },
        { label: "Select All", accelerator: "CmdOrCtrl+A", role: "selectAll" }
      ]
    },
    {
      label: "View",
      submenu: [
        { label: "Toggle Fullscreen", accelerator: "F11", click() { mainWindow?.setFullScreen(!mainWindow?.isFullScreen()) }}
      ]
    }
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

function createWindow(config: any) {
  mainWindow = new BrowserWindow({
    width: config.width,
    height: config.height,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    icon: path.join(__dirname, '/../../build/icons/512x512.png')
  })

  setWindowEvent()
  setWindowWebContents()
  setWindowMenu()
}

function getWindowConfig() {
  let data: any = settings.getSync('config')
  if (!data) {
    data = {
      width: 1024,
      height: 720
    }
  }
  return data
}

export function initWindow(): void {
  if (mainWindow !== null) {
    return
  }
  
  createWindow(getWindowConfig())
}

export const getWindow = (): BrowserWindow | null => mainWindow
