const storage = require('electron-json-storage')
const oauth2 = require('electron-oauth2');
const { app, BrowserWindow, Menu, shell } = require('electron')
const path = require('path')
const url = require('url')
const ipc = require('./ipc-event')
const appInfo = require('./appInfo')

let mainWindow

const initWindow = () => {
  storage.get('config', (error, data) => {
    if (error || !data) {
      data = {
        width: 1024,
        height: 720
      }
    }
    createWindow(data)
  })
}

const createWindow = (config) => {
  mainWindow = new BrowserWindow({
    width: config.width,
    height: config.height,
		autoHideMenuBar: true
  })

  mainWindow.setMenu(null)

  mainWindow.on("close", () => {
    storage.set('config', mainWindow.getBounds())
  })

  mainWindow.on('closed', function () {
    mainWindow = null
  })

  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, '../../app/index.html'),
    protocol: 'file:',
    slashes: true
  }))

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
    }
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

app.on('ready', () => {
  initWindow()
  ipc.init()
	appInfo.fetchLastVersion()
})

app.on('activate', () => {
  if (mainWindow === null) {
    initWindow()
  }
})

app.on('window-all-closed', () => {
  app.quit()
})
