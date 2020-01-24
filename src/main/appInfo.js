const { app, BrowserWindow, shell } = require('electron')
const os = require('os')
const path = require('path')
const url = require('url')
const electronLocalshortcut = require('electron-localshortcut')
const fetch = require('isomorphic-fetch')

const APP_VERSION = `v${app.getVersion()}`

let infoWindow
let latestVersion = APP_VERSION

const fetchLatestVersion = () => {
  fetch("https://api.github.com/repos/joostory/tumblr-editor/releases/latest")
    .then(res => {
      if (!res.ok) {
        throw res
      }
      return res
    })
    .then(res => res.json())
    .then(json => {
      latestVersion = json.tag_name
      if (appInfo.version != latestVersion) {
        openWindow()
      }
    })
    .catch(res => {
      // ignore
    })
}

const closeWindow = () => {
	if (infoWindow) {
		infoWindow.close()
	}
}

const openWindow = () => {
	infoWindow = new BrowserWindow({
		width:640,
		height:480,
		frame:false,
    titleBarStyle: 'hidden',
    webPreferences: {
      nodeIntegration: true
    },
		alwaysOnTop: true
	})

	infoWindow.loadURL(url.format({
    pathname: path.join(__dirname, '../../app/about.html'),
    protocol: 'file:',
    slashes: true
  }))

	electronLocalshortcut.register(infoWindow, 'Escape', closeWindow)
	electronLocalshortcut.register(infoWindow, 'CommandOrControl+W', closeWindow)

	infoWindow.on("closed", () => {
		electronLocalshortcut.unregister(infoWindow, 'Escape', closeWindow)
    electronLocalshortcut.unregister(infoWindow, 'CommandOrControl+W', closeWindow)
    infoWindow = null
	})

  const handleRedirect = (e, url) => {
    if(url != infoWindow.webContents.getURL()) {
      e.preventDefault()
      shell.openExternal(url)
      closeWindow()
    }
  }

  infoWindow.webContents.on('will-navigate', handleRedirect)
  infoWindow.webContents.on('new-window', handleRedirect)
}

const makePlatformString = () => {
  const platform = os.platform()
  if (platform == 'darwin') {
    return 'Mac'
  } else if (platform.indexOf('win') >= 0) {
    return 'Windows'
  } else {
    return platform
  }
}

const USER_AGENT = `Editor for Tistory ${APP_VERSION}`
const USER_AGENT_FULL = `${USER_AGENT} (With Chrome in ${makePlatformString()} Electron)`

module.exports = {
  version: APP_VERSION,
  latestVersion: () => latestVersion,
  openWindow: openWindow,
  closeWindow: closeWindow,
  fetchLatestVersion: fetchLatestVersion,
  userAgent: USER_AGENT,
  userAgentFull: USER_AGENT_FULL
}
