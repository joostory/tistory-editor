const { app, protocol } = require('electron')
const ipc = require('./ipc-event')
const settings = require('electron-settings')
const { initWindow } = require('./window')
const OAuthRequestManager = require('./oauth/OAuthRequestManager')

const PROTOCOL = "tistory-editor"

settings.configure({
  fileName: 'Settings'
})

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
  const url = new URL(urlString)
  let requestHandler = OAuthRequestManager.loadRequestInfo("oauth")
  if (requestHandler) {
    requestHandler(url.searchParams)
  }
})

app.setAsDefaultProtocolClient(PROTOCOL)

