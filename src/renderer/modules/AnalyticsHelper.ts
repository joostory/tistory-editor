import { ipcRenderer } from 'electron'

export function pageview(page: string, pageTitle: string): void {
  console.log('GA-PageView', page, pageTitle)
  ipcRenderer.send('ga-pageview', page, pageTitle)
}
