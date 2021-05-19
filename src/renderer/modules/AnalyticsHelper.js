import { ipcRenderer } from 'electron'

export function pageview(page, pageTitle) {
  console.log('GA-PageView', page, pageTitle)
  ipcRenderer.send('ga-pageview', page, pageTitle)
}
