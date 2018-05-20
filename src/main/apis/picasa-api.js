const oauth2 = require('electron-oauth2');
const path = require('path')
const fs = require('fs')
const fetch = require('isomorphic-fetch')
const querystring = require('querystring')
const ipc = require('../ipc-event')
const FormData = require('form-data')
const {clipboard, session} = require('electron')
const stream = require('stream')
const { parseString } = require('xml2js')
const Oauth2infoReader = require('../Oauth2infoReader')

const errorHandler = (res) => {
  if (!res.ok) {
		console.error("fetch failed", res)
    throw new Error(res.status)
  }

  return res.text()
}

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
			'scope': ['https://picasaweb.google.com/data/'],
			'response_type': 'code',
			'access_type': 'offline',
			'prompt': 'consent',
			'include_granted_scopes': 'true'
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

	fetchAlbums() {
		return fetch("https://picasaweb.google.com/data/feed/api/user/default?" + querystring.stringify({
			access_token: this.auth.access_token,
			kind: 'album',
			access: 'all'
		}), {
			headers: {
				"GData-Version": 3
			}
		})
		.then(errorHandler)
		.then(text => new Promise((resolve, reject) => parseString(text, (err, result) => {
			if (err) {
				reject(err)
			} else {
				resolve(result.feed.entry.map(entry => ({
					id: entry['gphoto:id'][0],
					title: entry['title'][0],
					type: entry['gphoto:albumType']? entry['gphoto:albumType'][0] : 'user'
				})))
			}
		})))
	}

	fetchImages(albumId, startIndex = 1, maxResults = 50) {
		return fetch(`https://picasaweb.google.com/data/feed/api/user/default/albumid/${albumId}?` + querystring.stringify({
			access_token: this.auth.access_token,
			kind: 'photo',
			access: 'all',
			'start-index': startIndex,
			'max-results': maxResults
		}), {
			headers: {
				"GData-Version": 3
			}
		})
		.then(errorHandler)
		.then(text => new Promise((resolve, reject) => parseString(text, (err, result) => {
			if (err) {
				reject(err)
			} else {
				resolve(result.feed.entry.map(item => ({
					id: item['id'][0],
					title: item['title'][0],
					summary: item['summary'][0],
					url: item['content'][0]['$']['src'],
					timestamp: item['gphoto:timestamp'][0],
					isVideo: !!item['gphoto:videostatus']
				})))
			}
		})))
	}
}
module.exports.PhotosApi = PhotosApi
