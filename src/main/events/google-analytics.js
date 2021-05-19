const { ipcMain } = require('electron')
const Analytics = require('electron-google-analytics')
const uuid = require('uuid')

const clientID = uuid.v4()
const analytics = new Analytics.default('UA-26767980-11')


module.exports = () => {
  ipcMain.on("ga-pageview", (evt, page, title) => {
    console.log('GA_PAGEVIEW', page, title)
    if (process.env.NODE_ENV !== 'production') {
      return
    }
    
    analytics.pageview("tistory-editor", page, title, clientID)
      .then(r => console.log("GA_SUCCESS", r))
      .catch(e => console.error("GA_FAILED", e))
  })
}
