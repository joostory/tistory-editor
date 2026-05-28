import * as queryString from 'querystring'
import axios from 'axios'
import { BrowserWindow } from 'electron'
import AuthUtils from '../lib/AuthUtils'

interface Oauth2Info {
  redirectUri?: string
  clientId: string
  clientSecret: string
  authorizationUrl: string
  tokenUrl: string
  useBasicAuthorizationHeader?: boolean
}

export default function initElectronOauth2(oauthInfo: Oauth2Info, windowParams: any, tokenMethod: string = 'POST') {
  function getAuthorizationCode(opts: any = {}): Promise<string> {
    if (!oauthInfo.redirectUri) {
      oauthInfo.redirectUri = 'https://joostory.github.io/tistory-editor/callback.html'
    }

    const urlParams: any = {
      response_type: 'code',
      redirect_uri: oauthInfo.redirectUri,
      client_id: oauthInfo.clientId,
      state: AuthUtils.generateRandomString(16)
    }

    if (opts.scope) {
      urlParams.scope = opts.scope
    }

    if (opts.accessType) {
      urlParams.access_type = opts.accessType
    }

    const url = oauthInfo.authorizationUrl + '?' + queryString.stringify(urlParams)

    return new Promise<string>((resolve, reject) => {
      const authWindow = new BrowserWindow(windowParams || { 'use-content-size': true })

      authWindow.loadURL(url)
      authWindow.show()

      authWindow.on('closed', () => {
        reject(new Error('window was closed by user'))
      })

      function onCallback(callbackUrl: string) {
        try {
          const parsedUrl = new URL(callbackUrl)
          const code = parsedUrl.searchParams.get('code')
          const error = parsedUrl.searchParams.get('error')

          if (error) {
            reject(new Error(error))
            authWindow.removeAllListeners('closed')
            setImmediate(() => {
              authWindow.close()
            })
          } else if (code) {
            resolve(code)
            authWindow.removeAllListeners('closed')
            setImmediate(() => {
              authWindow.close()
            })
          }
        } catch (e) {
          // ignore parsing error for non-http URLs if any
        }
      }

      authWindow.webContents.on('will-navigate', (_event: any, navigateUrl: string) => {
        onCallback(navigateUrl)
      })

      authWindow.webContents.on("did-navigate", (_event: any, navigateUrl: string) => {
        onCallback(navigateUrl)
      })
    })
  }

  function tokenRequest(data: any): Promise<any> {
    const header: any = {
      'Accept': 'application/json'
    }
    let url = oauthInfo.tokenUrl
    const fetchOptions: any = {
      method: tokenMethod
    }

    if (oauthInfo.useBasicAuthorizationHeader) {
      header.Authorization = 'Basic ' + Buffer.from(oauthInfo.clientId + ':' + oauthInfo.clientSecret).toString('base64')
    } else {
      Object.assign(data, {
        client_id: oauthInfo.clientId,
        client_secret: oauthInfo.clientSecret
      })
    }
    fetchOptions['headers'] = header

    if (tokenMethod === 'GET') {
      url = `${oauthInfo.tokenUrl}?${queryString.stringify(data)}`
    } else {
      header['Content-Type'] = 'application/x-www-form-urlencoded'
      fetchOptions['data'] = queryString.stringify(data)
    }

    return axios(url, fetchOptions)
      .then(res => res.data)
  }

  function getAccessToken(opts: any): Promise<any> {
    return getAuthorizationCode(opts)
      .then(authorizationCode => {
        let tokenRequestData: any = {
          code: authorizationCode,
          grant_type: 'authorization_code',
          redirect_uri: oauthInfo.redirectUri
        }
        tokenRequestData = Object.assign(tokenRequestData, opts.additionalTokenRequestData)
        return tokenRequest(tokenRequestData)
      })
  }

  function refreshToken(refreshTokenValue: string): Promise<any> {
    return tokenRequest({
      refresh_token: refreshTokenValue,
      grant_type: 'refresh_token',
      redirect_uri: oauthInfo.redirectUri
    })
  }

  return {
    getAuthorizationCode,
    getAccessToken,
    refreshToken
  }
}
