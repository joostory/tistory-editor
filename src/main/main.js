const { app } = require('electron')
const ipc = require('./ipc-event')
const settings = require('electron-settings')
const { initWindow } = require('./window')

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
