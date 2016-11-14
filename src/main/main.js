const storage = require('electron-json-storage')
const oauth2 = require('electron-oauth2');
const {app, BrowserWindow, Tray, ipcMain} = require('electron')
const path = require('path')
const url = require('url')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow
let auth

let initWindow = () => {
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

let createWindow = (config) => {
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
    pathname: path.join(__dirname, '../../build/index.html'),
    protocol: 'file:',
    slashes: true
  }))
}

let getAccessToken = (callback) => {
  const options = {
    scope: 'SCOPE',
    accessType: 'ACCESS_TYPE'
  };

  const myApiOauth = oauth2({
      clientId: '36e1d04a9ea41b74190fa78b1aabf82d',
      clientSecret: '36e1d04a9ea41b74190fa78b1aabf82d67a406c47824f9919267611c622d7e33ffc5698a',
      authorizationUrl: 'https://www.tistory.com/oauth/authorize/',
      tokenUrl: 'https://www.tistory.com/oauth/access_token/',
      useBasicAuthorizationHeader: false
  }, {
    alwaysOnTop: true,
    autoHideMenuBar: true,
    webPreferences: {
        nodeIntegration: false
    }
  })

  myApiOauth.getAccessToken(options)
    .then(token => callback(token))
    .catch(() => {
      callback();
    })
}

ipcMain.on("fetch-auth", (e, arg) => {
  storage.get("auth", (error, data) => {
    if (error) throw error

    if (data && data.access_token) {
      auth = data
      e.sender.send('receive-auth', auth)
    }
  })
})

ipcMain.on("request-auth", (e, arg) => {
  getAccessToken(token => {
    storage.set("auth", token)
    e.sender.send('receive-auth', auth)
  })
})

app.on('ready', initWindow)

app.on('activate', () => {
  if (mainWindow === null) {
    initWindow()
  }
})

app.on('window-all-closed', () => {
  app.quit()
})
