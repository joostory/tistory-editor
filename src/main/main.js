const { app, protocol } = require('electron')
const ipc = require('./ipc-event')
const settings = require('electron-settings')
const { initWindow, getWindow } = require('./window')
const OAuthRequestManager = require('./oauth/OAuthRequestManager')

const PROTOCOL = "tistory-editor"

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
  deeplinkingUrl = urlString
})

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
  return;
} else {
  app.on('second-instance', (e, argv) => {
    if (process.platform === 'darwin') {
      deeplinkingUrl = argv.find((arg) => arg.startsWith('tistory-editor://'));
    }

    const window = getWindow()

    if (window) {
      if (window.isMinimized()) window.restore();
      window.focus();

      console.log("OPEN-URL", deeplinkingUrl)
      const url = new URL(deeplinkingUrl)
      let requestHandler = OAuthRequestManager.loadRequestInfo("oauth")
      if (requestHandler) {
        requestHandler(url.searchParams)
      }
    }
  });
}

