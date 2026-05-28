import { shell } from 'electron'
import * as queryString from 'querystring'
const OAuth = require('oauth').OAuth

export default class ExternalOAuth1 {
  private oauthInfo: any
  private oauth: any
  private requestTokens: any

  constructor(oauthInfo: any) {
    this.oauthInfo = oauthInfo
    this.oauth = new OAuth(
      oauthInfo.requestTokenUrl,
      oauthInfo.tokenUrl,
      oauthInfo.clientKey,
      oauthInfo.clientSecret,
      '1.0a',
      oauthInfo.redirectUri,
      'HMAC-SHA1'
    )
  }

  requestAuth(successHandler: (tokens: any) => void): void {
    this.oauth.getOAuthRequestToken((error: any, token: string, tokenSecret: string) => {
      if (error) {
        throw new Error(error)
      }

      this.requestTokens = {
        token, tokenSecret
      }

      shell.openExternal(this.oauthInfo.authorizeUrl + '?' + queryString.stringify({
        oauth_token: token
      }))

      successHandler(this.requestTokens)
    })
  }

  requestToken(verifier: string, requestTokens: any, tokenHandler: any): void {
    this.oauth.getOAuthAccessToken(
      requestTokens.token,
      requestTokens.tokenSecret,
      verifier,
      tokenHandler
    )
  }
}
