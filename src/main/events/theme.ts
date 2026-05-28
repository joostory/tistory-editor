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
}
