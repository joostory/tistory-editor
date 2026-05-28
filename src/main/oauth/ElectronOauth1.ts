import { BrowserWindow } from 'electron'
const Oauth1 = require('oauth').OAuth

interface Oauth1Info {
  requestUrl: string
  accessUrl: string
  key: string
  secret: string
  version: string
  authCallback: string
  signatureMethod: string
  authenticateUrl: string
}

const tokenizerCallback = (resolve: any, reject: any) => 
  (error: any, token: string, tokenSecret: string) => {
    console.log("tokenizerCallback", error, token, tokenSecret)
    if (error) {
      return reject(error)
    }
    resolve({ token, tokenSecret })
  }

class Oauth {
  info: Oauth1Info
  oauth: any

  constructor(info: Oauth1Info) {
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

  getRequestTokens(): Promise<any> {
    return new Promise((resolve, reject) =>
      this.oauth.getOAuthRequestToken(tokenizerCallback(resolve, reject))
    )
  }

  getAccessToken(url: string, requestTokens: any): Promise<any> | undefined {
    const verifier = (new URL(url)).searchParams.get("oauth_verifier")
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
    return undefined
  }
}

const state: any = {
  requestTokens: {}
}

const bindWindowsEvents = (window: BrowserWindow, oauth: Oauth) =>
  (resolve: any, reject: any) => {
    window.webContents.on('close' as any, () => {
      console.log("closed window")
      reject('closed window')
    })
    window.webContents.on("will-redirect", (_evt: any, url: string) => {
      console.log("redirect", url)
      if (url.indexOf(oauth.info.authCallback) === 0) {
        resolve(oauth.getAccessToken(url, state.requestTokens))
      }
    })
  }

export default function login(info: Oauth1Info, window: BrowserWindow): Promise<any> {
  const oauth = new Oauth(info)
  const promise = new Promise(bindWindowsEvents(window, oauth))
  oauth.getRequestTokens().then(result => {
    state.requestTokens = result
    window.loadURL(`${info.authenticateUrl}?oauth_token=${result.token}`)
  })
  return promise
}
