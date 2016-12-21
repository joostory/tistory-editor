const storage = require('electron-json-storage')
const oauth2 = require('electron-oauth2');
const {app, BrowserWindow} = require('electron')
const path = require('path')
const url = require('url')
const ipc = require('./ipc-event')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
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
    height: config.height
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
}

app.on('ready', () => {
  initWindow()
  ipc.init()
})

app.on('activate', () => {
  if (mainWindow === null) {
    initWindow()
  }
})

app.on('window-all-closed', () => {
  app.quit()
})
