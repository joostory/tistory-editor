const settings = require('electron-settings')
const { app, ipcMain } = require('electron')

module.exports = () => {
	ipcMain.on("fetch-preferences", (evt) => {
    console.log('Main.receive: fetch-preferences')
		let data = settings.getSync('preferences')
		if (!data) {
			data = {}
		}
		evt.sender.send("receive-preferences", data)
	})

	ipcMain.on("save-preferences", (evt, preferences) => {
    console.log('Main.receive: save-preferences', preferences)
		settings.setSync("preferences", preferences)
		evt.sender.send("receive-preferences", preferences)
  })
  
  ipcMain.on("enable-exist-prompt", (evt) => {
    console.log('Main.receive: enable-exist-prompt')
    app.showExitPrompt = true
  })

  ipcMain.on("disable-exist-prompt", (evt) => {
    console.log('Main.receive: disable-exist-prompt')
    app.showExitPrompt = false
  })
}
