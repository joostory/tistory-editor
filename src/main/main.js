const storage = require('electron-json-storage')
const oauth2 = require('electron-oauth2');
const {app, BrowserWindow, Tray, ipcMain} = require('electron')
const path = require('path')
const url = require('url')
const fs = require('fs')
const fetch = require('node-fetch')
const querystring = require('querystring')

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
    pathname: path.join(__dirname, '../../build/index.html'),
    protocol: 'file:',
    slashes: true
  }))
}

const getAccessToken = (callback) => {
  oauth2info = JSON.parse(fs.readFileSync(path.join(__dirname, "../../oauth2info.json"), 'utf8'))
  const tistoryOAuth = oauth2(oauth2info, {
    alwaysOnTop: true,
    autoHideMenuBar: true,
    webPreferences: {
        nodeIntegration: false
    }
  })

  tistoryOAuth.getAccessToken()
    .then(token => callback(token))
    .catch((err) => {
      console.log(err)
      callback()
    })
}

const fetchBlogInfo = (auth) => {
  return fetch("https://www.tistory.com/apis/blog/info?" + querystring.stringify({
    access_token: auth.access_token,
    output: "json"
  }))
  .then(res => res.json())
}

ipcMain.on("fetch-info", (e, arg) => {
  storage.get("auth", (error, auth) => {
    if (error) throw error

    if (auth && auth.access_token) {
      fetchBlogInfo(auth).then(res => {
        if (res.tistory && res.tistory.status == 200) {
          let info = {
            id: res.tistory.id,
            blogs: res.tistory.item
          }
          e.sender.send('receive-info', info)
        }
      }).catch(err => {
        console.error(auth, err)
        e.sender.send('receive-info', null)
      })
    }
  })
})

ipcMain.on("request-auth", (e, arg) => {
  getAccessToken(auth => {
    storage.set("auth", auth)
    fetchBlogInfo.then(info => {
      e.sender.send('receive-info', auth)
    }).catch(err => {
      console.error(auth, err)
      e.sender.send('receive-info', null)
    })
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
