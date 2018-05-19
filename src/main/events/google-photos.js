const { ipcMain } = require('electron')
const settings = require('electron-settings')
const { GoogleAuthApi, PhotosApi } = require('../apis/picasa-api')

module.exports = () => {
	const authApi = new GoogleAuthApi()
	const fetchImages = async (evt, startIndex) => {
		console.log('fetchImage', startIndex)
		const auth = settings.get('google-auth')
		const photosData = settings.get('photos-data') || {}

		try {
			if (!auth || !auth.access_token) {
				throw new Error("NO_AUTH")
			}
			evt.sender.send('start-fetch-google-photos-images')
			const photosApi = new PhotosApi(auth)
			if (!photosData.albumId) {
				const albums = await photosApi.fetchAlbums()
				const instantUploadAlbum = albums.find(album => album.type == "InstantUpload")
        if (!instantUploadAlbum) {
          throw new Error("NO_ALBUM")
        }
				photosData.albumId = instantUploadAlbum.id
			}
			
			const images = await photosApi.fetchImages(photosData.albumId, startIndex, 50)
			if (startIndex === 1) {
				photosData.images = []
			}
			photosData.images.push(images)
			settings.set('photos-data', photosData)
			evt.sender.send('receive-google-photos-images', images)

		} catch(e) {
			console.error(e)
			if (auth && auth.refresh_token) {
				try {
					const refreshAuth = await authApi.refreshToken(auth.refresh_token)
					settings.set('google-auth', refreshAuth)
					fetchImages(evt, startIndex)
					return
				} catch (authError) {
					settings.set('google-auth', null)
				}
			}
			evt.sender.send('receive-google-connected', false)
		}
	}

	ipcMain.on('fetch-google-photos-images', (evt, startIndex) => {
		fetchImages(evt, startIndex)
	})

	ipcMain.on("request-google-photos-auth", (evt, arg) => {
		authApi.getAccessToken().then(auth => {
			settings.set('google-auth', auth)
			evt.sender.send('receive-google-connected', true)
			fetchImages(evt, 1)
		})
	})

	ipcMain.on("disconnect-google-photos-auth", (evt, arg) => {
		settings.delete('google-auth')
		evt.sender.send('receive-google-connected', false)
	})	
}
