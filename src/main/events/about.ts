import { ipcMain } from 'electron'
import * as appInfo from '#/main/appInfo'

export default function initAboutEvents(): void {
  ipcMain.handle("get-app-info", () => {
    return {
      version: appInfo.version,
      latestVersion: appInfo.latestVersion()
    }
  })
}
