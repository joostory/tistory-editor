import { app } from 'electron'
import * as ipc from '#/main/ipc-event'
import * as settings from 'electron-settings'
import { initWindow, getWindow } from '#/main/window'
import OAuthRequestManager from '#/main/oauth/OAuthRequestManager'
import { appState } from '#/main/appState'

const PROTOCOL = "tistory-editor"

console.log("DEBUG: platform", process.platform)
settings.configure({
  fileName: 'Settings'
})

let pendingDeeplinkingUrl: string | undefined
let isAppReady = false

app.setAsDefaultProtocolClient(PROTOCOL)
appState.showExitPrompt = false

function execOAuthRequestHandler(urlStr?: string) {
  if (!urlStr) return
  console.log("Processing OAuth URL:", urlStr)
  try {
    const url = new URL(urlStr)
    const requestHandler = OAuthRequestManager.loadRequestInfo("oauth")
    if (requestHandler) {
      requestHandler(url.searchParams)
    } else {
      console.warn("OAuth request handler not found yet.")
    }
  } catch (error) {
    console.error("Failed to parse or handle deep link URL:", error)
  }
}

function restoreWindow() {
  const window = getWindow()
  if (!window) return
  
  if (window.isMinimized()) {
    window.restore()
  }
  window.focus()
}

const gotTheLock = app.requestSingleInstanceLock()
console.log("DEBUG: gotTheLock", gotTheLock)

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (_e, argv) => {
    console.log("DEBUG: second-instance argv", argv)
    restoreWindow()
    
    if (process.platform !== 'darwin') {
      const url = argv.find((arg) => arg.startsWith(`${PROTOCOL}://`))
      if (url) {
        if (isAppReady) {
          execOAuthRequestHandler(url)
        } else {
          pendingDeeplinkingUrl = url
        }
      }
    }
  })

  app.on("open-url", (e, urlString) => {
    e.preventDefault()
    if (isAppReady) {
      execOAuthRequestHandler(urlString)
    } else {
      pendingDeeplinkingUrl = urlString
    }
  })

  app.on('ready', () => {
    isAppReady = true
    initWindow()
    ipc.init()

    if (process.platform !== 'darwin') {
      const url = process.argv.find((arg) => arg.startsWith(`${PROTOCOL}://`))
      if (url) {
        pendingDeeplinkingUrl = url
      }
    }

    if (pendingDeeplinkingUrl) {
      setTimeout(() => {
        execOAuthRequestHandler(pendingDeeplinkingUrl)
        pendingDeeplinkingUrl = undefined
      }, 100)
    }
  })

  app.on('activate', () => {
    const window = getWindow()
    if (!window) {
      initWindow()
    } else {
      restoreWindow()
    }
  })

  app.on('window-all-closed', () => {
    app.quit()
  })
}

