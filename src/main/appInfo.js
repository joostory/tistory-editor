const { app, BrowserWindow, shell } = require('electron')
const path = require('path')
const url = require('url')
const electronLocalshortcut = require('electron-localshortcut')
const fetch = require('node-fetch')

let infoWindow

const fetchLastVersion = () => {
  fetch("https://joostory.github.io/tistory-editor/app.json")
    .then(res => res.json())
    .then(json => {
      appInfo.lastVersion = json.version
      if (appInfo.version != appInfo.lastVersion) {
        openWindow()
      }
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
		infoWindow = null
		electronLocalshortcut.unregister(infoWindow, 'Escape', closeWindow)
		electronLocalshortcut.unregister(infoWindow, 'CommandOrControl+W', closeWindow)
	})

  var handleRedirect = (e, url) => {
    if(url != infoWindow.webContents.getURL()) {
      e.preventDefault()
      shell.openExternal(url)
      closeWindow()
    }
  }

  infoWindow.webContents.on('will-navigate', handleRedirect)
  infoWindow.webContents.on('new-window', handleRedirect)
}

let appInfo = {
  version: app.getVersion(),
	lastVersion: app.getVersion(),
  openWindow: openWindow,
  closeWindow: closeWindow,
  fetchLastVersion: fetchLastVersion
}

module.exports = appInfo
