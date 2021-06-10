const oauth2 = require('../oauth/ElectronOauth2');
const ExternalOAuth2 = require('../oauth/ExternalOAuth2')
const fetch = require('isomorphic-fetch')
const {clipboard, session} = require('electron')
const OauthInfoReader = require('../oauth/OauthInfoReader')
const appInfo = require('../appInfo');
const OAuthRequestManager = require('../oauth/OAuthRequestManager');

class GoogleAuthApi {
  #googleOAuth

	constructor() {
    this.#googleOAuth = null
	}

	makeGoogleOAuth() {
		if (!this.#googleOAuth) {
			const oauthInfoReader = new OauthInfoReader()
			const oauthInfo = oauthInfoReader.getGoogle()

			this.#googleOAuth = oauth2(oauthInfo, {
				alwaysOnTop: true,
				autoHideMenuBar: true,
				webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
					session: session.fromPartition("google:oauth2:" + new Date())
				}
			})
		}
		
		return this.#googleOAuth
	}

  requestAuth(successHandler, failureHandler) {
    const oauthInfoReader = new OauthInfoReader()
    const oauth2 = new ExternalOAuth2(oauthInfoReader.getGoogle())
    OAuthRequestManager.saveRequestInfo("oauth", (searchParams) => {
      const code = searchParams.get("code")
      oauth2.requestToken(code)
        .then(data => {
          if (data.error) {
            throw new Error(`${data.error}: ${data.error_description}`)
          }

          return data
        })
        .then(successHandler)
        .catch(failureHandler)
    })

    oauth2.requestAuth({
			scope: ['https://www.googleapis.com/auth/photoslibrary.readonly']
		})
  }

	getAccessToken() {
		return this.makeGoogleOAuth().getAccessToken({
			scope: ['https://www.googleapis.com/auth/photoslibrary.readonly']
		})
	}
	
	refreshToken(refreshToken) {
		return this.makeGoogleOAuth().refreshToken(refreshToken)
	}
}
module.exports.GoogleAuthApi = GoogleAuthApi


class PhotosApi {
	constructor(auth) {
		this.auth = auth
	}

  fetchMediaItems(pageSize = 100, nextPageToken = null) {
    console.log("fetchMediaItems", this.auth.access_token, pageSize, nextPageToken)
    return fetch('https://photoslibrary.googleapis.com/v1/mediaItems:search', {
      method: 'post',
      headers: {
        'Content-type': 'application/json',
        'Authorization': `Bearer ${this.auth.access_token}`
      },
      body: JSON.stringify({
        pageSize: pageSize,
        pageToken: nextPageToken,
        filters: {
          mediaTypeFilter: {
            mediaTypes: ['PHOTO']
          }
        }
      })
    })
    .then(res => {
      if (!res.ok) {
        console.error("fetch failed", res)
        throw new Error(res.status)
      }
    
      return res.json()
    })
    .then(json => {
      return {
        images: json.mediaItems.map(item => {
          const width = item.mediaMetadata.width > 1920? 1920 : item.mediaMetadata.width
          const thumbnailWidth = 340
          return {
            id: item.id,
            url: `${item.baseUrl}=w${width}`,
            thumbnail: `${item.baseUrl}=w${thumbnailWidth}`,
            title: item.filename,
            timestamp: item.mediaMetadata.creationTime
          }
        }),
        nextPageToken: json.nextPageToken
      }
      
    })
  }
}
module.exports.PhotosApi = PhotosApi
