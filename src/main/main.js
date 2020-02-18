const { app } = require('electron')
const ipc = require('./ipc-event')
const { initWindow } = require('./window')

app.showExitPrompt = false
app.on('ready', () => {
  initWindow()
  ipc.init()
	// appInfo.fetchLatestVersion()
})

app.on('activate', () => {
  initWindow()
})

app.on('window-all-closed', () => {
  app.quit()
})
