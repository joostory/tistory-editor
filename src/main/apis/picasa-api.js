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

const oauth2infoReader = new Oauth2infoReader()
const oauth2info = oauth2infoReader.getGoogle()
let googleOAuth = null

const makeGoogleOAuth = () => {
	if (!googleOAuth) {
		googleOAuth = oauth2(oauth2info, {
			alwaysOnTop: true,
			autoHideMenuBar: true,
			webPreferences: {
				nodeIntegration: false,
				session: session.fromPartition("google:oauth2:" + new Date())
			}
		})
	}
	
	return googleOAuth
}


module.exports.getAccessToken = () => {
  return makeGoogleOAuth().getAccessToken({
		'scope': ['https://picasaweb.google.com/data/'],
		'response_type': 'code',
		'access_type': 'offline',
		'prompt': 'consent',
		'include_granted_scopes': 'true'
  })
}

module.exports.refreshToken = (refreshToken) => {
	return makeGoogleOAuth().refreshToken(refreshToken)
}

module.exports.fetchAlbums = (auth) => {
  return fetch("https://picasaweb.google.com/data/feed/api/user/default?" + querystring.stringify({
		access_token: auth.access_token,
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
			resolve(result)
		}
	})))
}

module.exports.fetchImages = (auth, albumId, startIndex = 1, maxResults = 50) => {
	return fetch(`https://picasaweb.google.com/data/feed/api/user/default/albumid/${albumId}?` + querystring.stringify({
		access_token: auth.access_token,
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
			resolve(result)
		}
	})))
}
