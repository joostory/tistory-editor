const os = require('os')
const settings = require('electron-settings')
const { app, BrowserWindow, Menu, shell, dialog } = require('electron')
const path = require('path')
const url = require('url')
const ipc = require('./ipc-event')
const appInfo = require('./appInfo')

app.showExitPrompt = false
let mainWindow

const initWindow = () => {
	let data = settings.get('config')
	if (!data) {
		data = {
			width: 1024,
			height: 720
		}
  }
  if (process.env.NODE_ENV == "development") {
    const { default: installExtension, REACT_DEVELOPER_TOOLS } = require('electron-devtools-installer')
    installExtension(REACT_DEVELOPER_TOOLS)
      .then((name) => console.log(`Added Extension:  ${name}`))
      .catch((err) => console.log('An error occurred: ', err));
  }
	createWindow(data)
}

const createWindow = (config) => {
  mainWindow = new BrowserWindow({
    width: config.width,
    height: config.height,
    autoHideMenuBar: true,
    icon: `${__dirname}/../../build/icons/256x256.png`
  })

  mainWindow.setFullScreenable(true)
  mainWindow.setMenu(null)

  mainWindow.on("close", (e) => {
    if (app.showExitPrompt) {
      e.preventDefault()
      dialog.showMessageBox({
        type: 'question',
        buttons: ['Yes', 'No'],
        title: 'Confirm',
        message: '지금 앱을 종료하면 저장하지 않는 내용이 사라집니다. 종료하시겠습니까?'
      }, function (response) {
        if (response === 0) {
          app.showExitPrompt = false
          mainWindow.close()
        }
      })
    }
    settings.set('config', mainWindow.getBounds())
  })

  mainWindow.on('closed', function () {
    mainWindow = null
  })

  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, '../../app/index.html'),
    protocol: 'file:',
    slashes: true
  }))

  mainWindow.webContents.setUserAgent(appInfo.userAgentFull)

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
