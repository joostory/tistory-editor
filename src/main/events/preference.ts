import { app, ipcMain } from 'electron'
import * as settings from 'electron-settings'
import { appState } from '#/main/appState'

export default function initPreferenceEvents(): void {
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
    settings.setSync("preferences", preferences as any)
    evt.sender.send("receive-preferences", preferences)
  })
  
  ipcMain.on("enable-exist-prompt", () => {
    console.log('Main.receive: enable-exist-prompt')
    appState.showExitPrompt = true
  })

  ipcMain.on("disable-exist-prompt", () => {
    console.log('Main.receive: disable-exist-prompt')
    appState.showExitPrompt = false
  })
}
