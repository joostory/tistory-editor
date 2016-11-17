const oauth2 = require('electron-oauth2');
const path = require('path')
const fs = require('fs')
const fetch = require('node-fetch')
const querystring = require('querystring')
const ipc = require('./ipc-event')

const getAccessToken = (callback) => {
  oauth2info = JSON.parse(fs.readFileSync(path.join(__dirname, "../../oauth2info.json"), 'utf8'))
  const tistoryOAuth = oauth2(oauth2info, {
    alwaysOnTop: true,
    autoHideMenuBar: true,
    webPreferences: {
        nodeIntegration: false
    }
  })

  tistoryOAuth.getAccessToken()
    .then(token => callback(token))
    .catch((err) => {
      console.log(err)
      callback()
    })
}

const fetchBlogInfo = (auth) => {
  return fetch("https://www.tistory.com/apis/blog/info?" + querystring.stringify({
    access_token: auth.access_token,
    output: "json"
  }))
  .then(res => res.json())
}


module.exports = {
	getAccessToken: getAccessToken,
	fetchBlogInfo: fetchBlogInfo
}
