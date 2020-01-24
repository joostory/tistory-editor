const Oauth1 = require('oauth').OAuth

const tokenizerCallback = (resolve, reject) => 
(error, token, tokenSecret) => {
  console.log("tokenizerCallback", error, token, tokenSecret)
  if (error)
    return reject(error)
  resolve({token,tokenSecret})
}

class Oauth {
  constructor(info){
    this.info = info
    this.oauth = new Oauth1(
      info.requestUrl,
      info.accessUrl,
      info.key,
      info.secret,
      info.version,
      info.authCallback,
      info.signatureMethod
    )
  }

  getRequestTokens(){
    return new Promise((resolve, reject) =>
      this.oauth.getOAuthRequestToken(tokenizerCallback(resolve, reject))
    )
  }

  getAccessToken(url, requestTokens){
    let verifier = (new URL(url)).searchParams.get("oauth_verifier")
    if (verifier) {
      return new Promise((resolve, reject) =>
        this.oauth.getOAuthAccessToken(
          requestTokens.token,
          requestTokens.tokenSecret,
          verifier,
          tokenizerCallback(resolve, reject)
        )
      )
    }
  }
}

let _ = {
  requestTokens: {}
}

const bindWindowsEvents = (window, oauth) =>
  (resolve, reject) => {
    window.webContents.on('close', () => {
      console.log("closed window")
      reject('closed window')
    })
    window.webContents.on("will-redirect", (__, url) => {
      console.log("redirect", url)
      if (url.indexOf(oauth.info.authCallback) == 0) {
        resolve(oauth.getAccessToken(url, _.requestTokens))
      }
    })
  }

const login = (info, window) => {
  let oauth = new Oauth(info)
  let promise = new Promise(bindWindowsEvents(window, oauth))
  oauth.getRequestTokens().then(result => {
    _.requestTokens = result
    window.loadURL(`${info.authenticateUrl}?oauth_token=${result.token}`)
  })
  return promise
}

module.exports = login
