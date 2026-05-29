import { app } from 'electron'
import * as ipc from '#/main/ipc-event'
import * as settings from 'electron-settings'
import { initWindow, getWindow } from '#/main/window'
import OAuthRequestManager from '#/main/oauth/OAuthRequestManager'

const PROTOCOL = "tistory-editor"

console.log("DEBUG: platform", process.platform)
settings.configure({
  fileName: 'Settings'
})

let deeplinkingUrl: string | undefined
app.setAsDefaultProtocolClient(PROTOCOL)
;(app as any).showExitPrompt = false

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
  e.preventDefault()
  
  if (process.platform === 'darwin') {
    execOAuthRequestHandler(urlString)
  } else {
    deeplinkingUrl = urlString
  }
})

function execOAuthRequestHandler(deeplinkingUrlStr?: string) {
  if (!deeplinkingUrlStr) return
  console.log("OPEN-URL", deeplinkingUrlStr)
  const url = new URL(deeplinkingUrlStr)
  const requestHandler = OAuthRequestManager.loadRequestInfo("oauth")
  if (requestHandler) {
    requestHandler(url.searchParams)
  }
}

function restoreWindow() {
  const window = getWindow()
  if (!window) {
    return
  }
  if (window.isMinimized()) {
    window.restore()
  }

  window.focus();
}

const gotTheLock = app.requestSingleInstanceLock();
console.log("DEBUG: gotTheLock", gotTheLock)
if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (_e, argv) => {
    console.log("DEBUG: second-instance argv", argv)
    if (process.platform !== 'darwin') {
      deeplinkingUrl = argv.find((arg) => arg.startsWith('tistory-editor://'));
    }

    restoreWindow()
    if (deeplinkingUrl) {
      execOAuthRequestHandler(deeplinkingUrl)
    }
  })
}
