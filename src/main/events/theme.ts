import { ipcMain, nativeTheme, BrowserWindow } from 'electron'

export default function initThemeEvents(): void {
  // 렌더러가 현재 OS 다크모드 값을 가져가는 핸들러
  ipcMain.handle('get-native-theme-dark-mode', () => {
    return nativeTheme.shouldUseDarkColors
  })

  // OS 테마 상태 업데이트 이벤트를 감지하여 활성화된 모든 창에 전송
  nativeTheme.on('updated', () => {
    const isDark = nativeTheme.shouldUseDarkColors
    BrowserWindow.getAllWindows().forEach((win) => {
      if (!win.isDestroyed()) {
        win.webContents.send('native-theme-updated', isDark)
      }
    })
  })

  // 창 최소화, 최대화, 종료 IPC 제어 핸들러 추가
  ipcMain.on('window-minimize', (event) => {
    const webContents = event.sender
    const win = BrowserWindow.fromWebContents(webContents)
    if (win) win.minimize()
  })

  ipcMain.on('window-maximize', (event) => {
    const webContents = event.sender
    const win = BrowserWindow.fromWebContents(webContents)
    if (win) {
      if (win.isMaximized()) {
        win.unmaximize()
      } else {
        win.maximize()
      }
    }
  })

  ipcMain.on('window-close', (event) => {
    const webContents = event.sender
    const win = BrowserWindow.fromWebContents(webContents)
    if (win) win.close()
  })
}
