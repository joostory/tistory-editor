const settings = require('electron-settings')
const { ipcMain } = require('electron')

module.exports = () => {
	ipcMain.on("fetch-preferences", (evt) => {
		let data = settings.get('preferences')
		if (!data) {
			data = {}
		}
		evt.sender.send("receive-preferences", data)
	})

	ipcMain.on("save-preferences", (evt, preferences) => {
		settings.set("preferences", preferences)
		evt.sender.send("receive-preferences", preferences)
	})
}
