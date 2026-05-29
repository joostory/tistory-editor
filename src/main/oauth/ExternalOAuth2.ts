import * as queryString from 'querystring'
import axios from 'axios'
import { shell } from 'electron'
import AuthUtils from '#/main/lib/AuthUtils'

export default class ExternalOAuth2 {
  private oauthInfo: any
  private state: string

  constructor(oauthInfo: any) {
    this.oauthInfo = oauthInfo
    this.state = AuthUtils.generateRandomString(16)
  }

  getState(): string {
    return this.state
  }

  requestAuth(opts: any = {}): void {
    const urlParams: any = {
      response_type: 'code',
      redirect_uri: this.oauthInfo.redirectUri,
      client_id: this.oauthInfo.clientId,
      state: this.state
    }

    if (opts.scope) {
      urlParams.scope = opts.scope
    }

    if (opts.accessType) {
      urlParams.access_type = opts.accessType
    }

    const url = this.oauthInfo.authorizationUrl + '?' + queryString.stringify(urlParams)
    shell.openExternal(url)
  }

  requestToken(authorizationCode: string, tokenMethod: string = 'POST'): Promise<any> {
    const tokenRequestData: any = {
      code: authorizationCode,
      grant_type: 'authorization_code',
      redirect_uri: this.oauthInfo.redirectUri,
      client_id: this.oauthInfo.clientId,
      client_secret: this.oauthInfo.clientSecret
    }

    let url = this.oauthInfo.tokenUrl
    const fetchOptions: any = {
      method: tokenMethod,
      headers: {
        'Accept': 'application/json'
      }
    }

    if (tokenMethod === 'GET') {
      url = `${this.oauthInfo.tokenUrl}?${queryString.stringify(tokenRequestData)}`
    } else {
      fetchOptions['headers']['Content-Type'] = 'application/x-www-form-urlencoded'
      fetchOptions['body'] = queryString.stringify(tokenRequestData)
    }

    return axios(url, fetchOptions)
      .then(res => res.data)
  }
}
