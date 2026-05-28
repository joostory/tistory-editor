import { ipcMain } from 'electron'
import AnalyticsModule from 'electron-google-analytics'
import { v4 as uuidv4 } from 'uuid'

const Analytics = typeof AnalyticsModule === 'function' ? AnalyticsModule : (AnalyticsModule as any).default
const clientID = uuidv4()
const analytics = new Analytics('UA-26767980-11')

export default function initGoogleAnalytics(): void {
  ipcMain.on("ga-pageview", (_evt, page: string, title: string) => {
    console.log('GA_PAGEVIEW', page, title)
    if (process.env.NODE_ENV !== 'production') {
      return
    }
    
    analytics.pageview("tistory-editor", page, title, clientID)
      .then(r => console.log("GA_SUCCESS", r))
      .catch(e => console.error("GA_FAILED", e))
  })
}
