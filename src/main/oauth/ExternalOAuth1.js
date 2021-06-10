const electron = require('electron');
const queryString = require('querystring');
const OAuth = require('oauth').OAuth

class ExternalOAuth2 {
  #oauthInfo
  #oauth
  #requestTokens

  constructor(oauthInfo) {
    this.#oauthInfo = oauthInfo
    this.#oauth = new OAuth(
      oauthInfo.requestTokenUrl,
      oauthInfo.tokenUrl,
      oauthInfo.clientKey,
      oauthInfo.clientSecret,
      '1.0a',
      oauthInfo.redirectUri,
      'HMAC-SHA1'
    )
  }

  requestAuth(successHandler) {
    this.#oauth.getOAuthRequestToken((error, token, tokenSecret) => {
      if (error) {
        throw new Error(error)
      }

      this.#requestTokens = {
        token, tokenSecret
      }

      electron.shell.openExternal(this.#oauthInfo.authorizeUrl + '?' + queryString.stringify({
        oauth_token: token
      }))

      successHandler(this.#requestTokens)
    })
  }

  requestToken(verifier, requestTokens, tokenHandler) {
    this.#oauth.getOAuthAccessToken(
      requestTokens.token,
      requestTokens.tokenSecret,
      verifier,
      tokenHandler
    )
  }

}

module.exports = ExternalOAuth2
