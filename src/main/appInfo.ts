import { app, BrowserWindow, shell } from 'electron'
import * as os from 'os'
import * as path from 'path'
import * as url from 'url'
import * as electronLocalshortcut from 'electron-localshortcut'
import fetch from 'isomorphic-fetch'

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
  infoWindow = new BrowserWindow({
    width: 640,
    height: 480,
    frame: false,
    titleBarStyle: 'hidden',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      // @ts-ignore
      enableRemoteModule: true
    },
    alwaysOnTop: true
  })

  infoWindow.loadURL(url.format({
    pathname: path.join(__dirname, '../renderer/about.html'),
    protocol: 'file:',
    slashes: true
  }))

  electronLocalshortcut.register(infoWindow, 'Escape', closeWindow)
  electronLocalshortcut.register(infoWindow, 'CommandOrControl+W', closeWindow)

  infoWindow.on("closed", () => {
    if (infoWindow) {
      electronLocalshortcut.unregister(infoWindow, 'Escape', closeWindow)
      electronLocalshortcut.unregister(infoWindow, 'CommandOrControl+W', closeWindow)
    }
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
  // @ts-ignore
  infoWindow.webContents.on('new-window', handleRedirect)
}

export const fetchLatestVersion = () => {
  fetch("https://api.github.com/repos/joostory/tumblr-editor/releases/latest")
    .then(res => {
      if (!res.ok) {
        throw res
      }
      return res
    })
    .then(res => res.json())
    .then(json => {
      latestVersionStr = json.tag_name
      if (version !== latestVersionStr) {
        openWindow()
      }
    })
    .catch(() => {
      // ignore
    })
}
