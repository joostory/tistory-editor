const { ipcMain } = require('electron')
const settings = require('electron-settings')
const picasa = require('../apis/picasa-api')

module.exports = () => {
	const fetchAlbums = async (evt) => {
		const auth = settings.get('google-auth')
		try {
			if (!auth || !auth.access_token) {
				throw new Error("NO_AUTH")
			}

			const result = await picasa.fetchAlbums(auth)
			evt.sender.send('receive-google-photos-albums', result.feed.entry)

		} catch(e) {
			console.error(e)
			if (auth && auth.refresh_token) {
				try {
					const refreshAuth = await picasa.refreshToken(auth.refresh_token)
					settings.set('google-auth', refreshAuth)
					fetchAlbums(evt)
					return
				} catch (authError) {
					settings.set('google-auth', null)
				}
			}

			evt.sender.send('receive-google-photos-albums', null)
		}
	}

	const fetchImages = async (evt, albumId, startIndex) => {
		const auth = settings.get('google-auth')

		try {
			if (!auth || !auth.access_token) {
				throw new Error("NO_AUTH")
			}

			const result = await picasa.fetchImages(auth, albumId, startIndex, 50)
			evt.sender.send('receive-google-photos-images', result.feed.entry)

		} catch(e) {
			console.error(e)
			if (auth && auth.refresh_token) {
				try {
					const refreshAuth = await picasa.refreshToken(auth.refresh_token)
					settings.set('google-auth', refreshAuth)
					fetchImages(evt)
					return
				} catch (authError) {
					settings.set('google-auth', null)
				}
			}
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
