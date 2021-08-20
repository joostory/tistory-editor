const { app, protocol } = require('electron')
const ipc = require('./ipc-event')
const settings = require('electron-settings')
const remote = require('@electron/remote/main')
const { initWindow, getWindow } = require('./window')
const OAuthRequestManager = require('./oauth/OAuthRequestManager')

const PROTOCOL = "tistory-editor"

remote.initialize()
console.log("DEBUG: platform", process.platform)
settings.configure({
  fileName: 'Settings'
})

let deeplinkingUrl
app.setAsDefaultProtocolClient(PROTOCOL)
app.showExitPrompt = false

app.on('ready', () => {
  initWindow()
  ipc.init()
})

app.on('activate', () => {
  initWindow()
})

app.on('window-all-closed', () => {
  app.quit()
})

app.on("open-url", (e, urlString) => {
  e.preventDefault()
  
  if (process.platform === 'darwin') {
    execOAuthRequestHandler(urlString)
  } else {
    deeplinkingUrl = urlString
  }
})

function execOAuthRequestHandler(deeplinkingUrl) {
  console.log("OPEN-URL", deeplinkingUrl)
  const url = new URL(deeplinkingUrl)
  let requestHandler = OAuthRequestManager.loadRequestInfo("oauth")
  if (requestHandler) {
    requestHandler(url.searchParams)
  }
}

function restoreWindow() {
  const window = getWindow()
  if (!window) {
    return
  }
  if (window.isMinimized()) {
    window.restore()
  }

  window.focus();
}

const gotTheLock = app.requestSingleInstanceLock();
console.log("DEBUG: gotTheLock", gotTheLock)
if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (e, argv) => {
    console.log("DEBUG: second-instance argv", argv)
    if (process.platform !== 'darwin') {
      deeplinkingUrl = argv.find((arg) => arg.startsWith('tistory-editor://'));
    }

    restoreWindow()
    execOAuthRequestHandler(deeplinkingUrl)
  })
}

