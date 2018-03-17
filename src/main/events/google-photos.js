const { ipcMain } = require('electron')
const settings = require('electron-settings')
const picasa = require('../apis/picasa-api')

module.exports = () => {
	const fetchAlbums = (evt) => {
		const auth = settings.get('google-auth')
		if (auth && auth.access_token) {
			picasa.fetchAlbums(auth, json => {
				evt.sender.send('receive-google-photos-albums', json.feed.entry)
			}).catch(err => {
				console.error(err)
				if (auth.refresh_token) {
					picasa.refreshToken(auth.refresh_token).then(auth => {
						settings.set('google-auth', auth)
						fetchAlbums(evt)
					}).catch(err => {
						evt.sender.send('receive-google-photos-albums', null)
					})
				} else {
					evt.sender.send('receive-google-photos-albums', null)
				}
			})
		} else {
			console.error("no auth")
			evt.sender.send('receive-google-photos-albums', null)
		}
	}

	const fetchImages = (evt, albumId, startIndex) => {
		const auth = settings.get('google-auth')

		if (auth && auth.access_token) {
			picasa.fetchImages(auth, albumId, startIndex, 50, json => {
				evt.sender.send('receive-google-photos-images', json.feed.entry)
			}).catch(err => {
				console.error(err)
				if (auth.refresh_token) {
					picasa.refreshToken(auth.refresh_token).then(auth => {
						settings.set('google-auth', auth)
						fetchImages(evt)
					}).catch(err => {
						evt.sender.send('receive-google-photos-images', null)
					})
				} else {
					evt.sender.send('receive-google-photos-images', null)
				}
			})
		} else {
			console.error("no auth")
			evt.sender.send('receive-google-photos-images', null)
		}
	}

	ipcMain.on('fetch-google-photos-albums', (evt) => {
		fetchAlbums(evt)
	})

	ipcMain.on('fetch-google-photos-images', (evt, albumId, startIndex) => {
		fetchImages(evt, albumId, startIndex)
	})

	ipcMain.on("request-google-photos-auth", (evt, arg) => {
		picasa.getAccessToken().then(auth => {
			settings.set('google-auth', auth)
			fetchAlbums(evt)
		})
	})

	ipcMain.on("disconnect-google-photos-auth", (evt, arg) => {
		settings.delete('google-auth')
	})	
}
