const settings = require('electron-settings')
const { app, BrowserWindow, Menu, shell, dialog } = require('electron')
const path = require('path')
const fs = require('fs')
const url = require('url')
const appInfo = require('./appInfo')

let mainWindow = null

function setWindowEvent() {
  mainWindow.on("close", (e) => {
    if (app.showExitPrompt) {
      e.preventDefault()
      dialog.showMessageBox({
        type: 'question',
        buttons: ['Yes', 'No'],
        title: 'Confirm',
        message: '지금 앱을 종료하면 저장하지 않는 내용이 사라집니다. 종료하시겠습니까?'
      }).then(result => {
        if (result.response === 0) {
          app.showExitPrompt = false
          mainWindow.close()
        }
      })
    }
    settings.setSync('config', mainWindow.getBounds())
  })

  mainWindow.on('closed', function () {
    mainWindow = null
  })
}

function setWindowWebContents() {
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, '../../app/index.html'),
    protocol: 'file:',
    slashes: true
  }), {
    userAgent: appInfo.userAgentFull
  })

  if (process.env.NODE_ENV == "development") {
    mainWindow.webContents.openDevTools()
  }

  var handleRedirect = (e, url) => {
    if(url != mainWindow.webContents.getURL()) {
      e.preventDefault()
      shell.openExternal(url)
    }
  }

  mainWindow.webContents.on('will-navigate', handleRedirect)
  mainWindow.webContents.on('new-window', handleRedirect)
  require('@electron/remote/main').enable(mainWindow.webContents)
}

function setWindowMenu() {
  mainWindow.setMenu(null)

  // Create the Application's main menu
  var template = [
    {
      label: "Application",
      submenu: [
        { label: "About", click() { appInfo.openWindow() }},
        { label: "Preferences...", accelerator: "CmdOrCtrl+,", click() { mainWindow.webContents.send("open-preference") }},
        { type: "separator" },
        { label: "Quit", accelerator: "CmdOrCtrl+Q", click() { app.quit() }}
      ]
    },
    {
      label: "Edit",
      submenu: [
        { label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
        { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
        { type: "separator" },
        { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
        { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
        { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
        { label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:" }
      ]
    },
    {
      label: "View",
      submenu: [
        { label: "Toggle Fullscreen", accelerator: "F11", click() { mainWindow.setFullScreen(!mainWindow.isFullScreen()) }}
      ]
    }
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

function createWindow(config) {
  mainWindow = new BrowserWindow({
    width: config.width,
    height: config.height,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    },
    icon: path.join(__dirname, '/../../build/icons/512x512.png')
  })

  setWindowEvent()
  setWindowWebContents()
  setWindowMenu()
}

function getWindowConfig() {
  let data = settings.getSync('config')
	if (!data) {
		data = {
			width: 1024,
			height: 720
		}
  }
  return data
}

module.exports.initWindow = function initWindow() {
  if (mainWindow !== null) {
    return
  }
	
	createWindow(getWindowConfig())
}

module.exports.getWindow = () => mainWindow

