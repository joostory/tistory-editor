import { app, BrowserWindow, shell } from 'electron'
import * as os from 'os'
import * as path from 'path'
import * as url from 'url'
import * as electronLocalshortcut from 'electron-localshortcut'
import axios from 'axios'

const APP_VERSION = `v${app.getVersion()}`

let infoWindow: BrowserWindow | null = null
let latestVersionStr: string = APP_VERSION

export const version = APP_VERSION
export const latestVersion = () => latestVersionStr
export const userAgent = `Editor for Tistory ${APP_VERSION}`

const makePlatformString = () => {
  const platform = os.platform()
  if (platform === 'darwin') {
    return 'Mac OS X'
  } else if (platform.indexOf('win') >= 0) {
    return 'Windows'
  } else {
    return platform
  }
}

export const userAgentFull = `${userAgent} (With Chrome in ${makePlatformString()} Electron)`

export const closeWindow = () => {
  if (infoWindow) {
    infoWindow.close()
  }
}

export const openWindow = () => {
  if (infoWindow) {
    infoWindow.focus()
    return
  }

  infoWindow = new BrowserWindow({
    width: 640,
    height: 480,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    alwaysOnTop: true
  })

  if (process.env.NODE_ENV === 'development' && process.env['ELECTRON_RENDERER_URL']) {
    infoWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/about.html`)
  } else {
    infoWindow.loadURL(url.format({
      pathname: path.join(__dirname, '../renderer/about.html'),
      protocol: 'file:',
      slashes: true
    }))
  }

  electronLocalshortcut.register(infoWindow, 'Escape', closeWindow)
  electronLocalshortcut.register(infoWindow, 'CommandOrControl+W', closeWindow)

  infoWindow.on("close", () => {
    if (infoWindow) {
      electronLocalshortcut.unregister(infoWindow, 'Escape', closeWindow)
      electronLocalshortcut.unregister(infoWindow, 'CommandOrControl+W', closeWindow)
    }
  })

  infoWindow.on("closed", () => {
    infoWindow = null
  })

  const handleRedirect = (e: any, urlStr: string) => {
    if (infoWindow && urlStr !== infoWindow.webContents.getURL()) {
      e.preventDefault()
      shell.openExternal(urlStr)
      closeWindow()
    }
  }

  infoWindow.webContents.on('will-navigate', handleRedirect)
  
  infoWindow.webContents.setWindowOpenHandler(({ url: urlStr }) => {
    shell.openExternal(urlStr)
    closeWindow()
    return { action: 'deny' }
  })

  // appInfo 창을 열었을 때 최신 버전을 비동기로 조회하도록 처리
  if (process.env.NODE_ENV !== 'development') {
    fetchLatestVersion()
  }
}

export const fetchLatestVersion = () => {
  axios.get("https://api.github.com/repos/joostory/tistory-editor/releases/latest", {
    headers: {
      'User-Agent': userAgent
    }
  })
    .then(res => {
      const data = res.data
      if (data && data.tag_name) {
        latestVersionStr = data.tag_name
        if (infoWindow && !infoWindow.isDestroyed()) {
          infoWindow.webContents.send('latest-version-updated', {
            version: APP_VERSION,
            latestVersion: latestVersionStr
          })
        }
      }
    })
    .catch((err) => {
      console.error("Failed to fetch latest version:", err)
    })
}
