const oauth2 = require('../oauth/ElectronOauth2');
const fetch = require('isomorphic-fetch')
const {clipboard, session} = require('electron')
const Oauth2infoReader = require('../oauth/Oauth2infoReader')
const appInfo = require('../appInfo')

class GoogleAuthApi {
	constructor() {
		this.googleOAuth = null
	}

	makeGoogleOAuth() {
		if (!this.googleOAuth) {
			const oauth2infoReader = new Oauth2infoReader()
			const oauth2info = oauth2infoReader.getGoogle()

			this.googleOAuth = oauth2(oauth2info, {
				alwaysOnTop: true,
				autoHideMenuBar: true,
				webPreferences: {
					nodeIntegration: false,
					session: session.fromPartition("google:oauth2:" + new Date())
				}
			})
		}
		
		return this.googleOAuth
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
