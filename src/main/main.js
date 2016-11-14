const storage = require('electron-json-storage')
const oauth2 = require('electron-oauth2');
const {app, BrowserWindow, Tray} = require('electron')
const path = require('path')
const url = require('url')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow
let config
let auth

let initWindow = () => {
  if (!config) {
    storage.get('config', (error, data) => {
      if (error) throw error
      config = data
      createWindow()
    })
  } else {
    config = {
      width: 1024,
      height: 720
    }
    createWindow()
  }
}

let createWindow = () => {

  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: config.width,
    height: config.height
  })

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })

  loadMainWindow()
  // and load the index.html of the app.

}

let loadMainWindow = () => {

  storage.get("auth", (error, data) => {
    if (error) throw error

    if (data && data.access_token) {
      auth = data
      mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, '../../build/index.html'),
        protocol: 'file:',
        slashes: true
      }))
    } else {
      getAccessToken(token => {
        auth = token
        storage.set("auth", token)
        mainWindow.loadURL(url.format({
          pathname: path.join(__dirname, '../../build/index.html'),
          protocol: 'file:',
          slashes: true
        }))
      })
    }
  })
}

let getAccessToken = (callback) => {
  const options = {
    scope: 'SCOPE',
    accessType: 'ACCESS_TYPE'
  };

  const myApiOauth = oauth2({
      clientId: 'aff98191eeaea1caad63d6771ddb65e5',
      clientSecret: 'aff98191eeaea1caad63d6771ddb65e5de9942d79478d31bff029fab846f2c1f886bdc5d',
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

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', initWindow)

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    initWindow()
  }
})

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  // if (process.platform !== 'darwin') {
    app.quit()
  // }
})

app.on('quit', () => {
  let currentSize = mainWindow.getSize()
  config.width = currentSize[0]
  config.height = currentSize[1]

  storage.set('config', config)
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
