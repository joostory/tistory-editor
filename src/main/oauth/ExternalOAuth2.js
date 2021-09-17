const queryString = require('querystring');
const axios = require('axios')
const electron = require('electron');
const AuthUtils = require('../lib/AuthUtils')

class ExternalOAuth2 {
  #oauthInfo
  #state

  constructor(oauthInfo) {
    this.#oauthInfo = oauthInfo
    this.#state = AuthUtils.generateRandomString(16)
  }

  getState() {
    return this.#state
  }

  requestAuth(opts) {
    opts = opts || {};

    var urlParams = {
      response_type: 'code',
      redirect_uri: this.#oauthInfo.redirectUri,
      client_id: this.#oauthInfo.clientId,
      state: this.#state
    };

    if (opts.scope) {
      urlParams.scope = opts.scope;
    }

    if (opts.accessType) {
      urlParams.access_type = opts.accessType;
    }

    var url = this.#oauthInfo.authorizationUrl + '?' + queryString.stringify(urlParams);
    electron.shell.openExternal(url)
  }

  requestToken(authorizationCode, tokenMethod = 'POST') {
    var tokenRequestData = {
      code: authorizationCode,
      grant_type: 'authorization_code',
      redirect_uri: this.#oauthInfo.redirectUri,
      client_id: this.#oauthInfo.clientId,
      client_secret: this.#oauthInfo.clientSecret
    };

    let url = this.#oauthInfo.tokenUrl;
    let fetchOptions = {
      method: tokenMethod,
      headers: {
        'Accept': 'application/json'
      }
    };

    if (tokenMethod == 'GET') {
      url = `${this.#oauthInfo.tokenUrl}?${queryString.stringify(tokenRequestData)}`
    } else {
      fetchOptions['headers']['Content-Type'] = 'application/x-www-form-urlencoded';
      fetchOptions['body'] = queryString.stringify(tokenRequestData);
    }

    return axios(url, fetchOptions)
      .then(res => res.data)
  }
}

module.exports = ExternalOAuth2
