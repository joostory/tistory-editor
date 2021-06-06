const { app, protocol } = require('electron')
const ipc = require('./ipc-event')
const settings = require('electron-settings')
const { initWindow } = require('./window')
const OAuthRequestManager = require('./oauth/OAuthRequestManager')
const ProviderApiManager = require('./lib/ProviderApiManager')

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
  console.log("OPEN_URL", urlString, url, url.pathname, url.searchParams.get('code'), url.searchParams.get('state'))
  const requestHandler = OAuthRequestManager.loadRequestInfo(url.searchParams.get('state'))
  if (requestHandler) {
    requestHandler(url.searchParams.get('code'))
  }
})

app.setAsDefaultProtocolClient(PROTOCOL)

