const { app, protocol } = require('electron')
const url = require('url')
const ipc = require('./ipc-event')
const settings = require('electron-settings')
const { initWindow } = require('./window')

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

app.on("open-url", (e, data) => {
  e.preventDefault()
  // tistory-editor://tistory-editor/callback?state=app
  console.log("open url", url.parse(data))
})

app.setAsDefaultProtocolClient(PROTOCOL)

