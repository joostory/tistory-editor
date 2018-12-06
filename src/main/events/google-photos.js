const { ipcMain } = require('electron')
const settings = require('electron-settings')
const { GoogleAuthApi, PhotosApi } = require('../apis/photos-api')

module.exports = () => {
	const authApi = new GoogleAuthApi()
	const fetchImages = async (evt, nextPageToken) => {
		console.log('fetchImage', nextPageToken)
		const auth = settings.get('google-auth')

		try {
			if (!auth || !auth.access_token) {
				throw new Error("NO_AUTH")
			}
			evt.sender.send('start-fetch-google-photos-images')
      const photosApi = new PhotosApi(auth)
      const data = await photosApi.fetchMediaItems(50, nextPageToken)
      evt.sender.send('receive-google-photos-images', data)

		} catch(e) {
			console.error(e)
			if (auth && auth.refresh_token) {
				try {
					const refreshAuth = await authApi.refreshToken(auth.refresh_token)
					settings.set('google-auth', refreshAuth)
          fetchImages(evt, nextPageToken)
          return
				} catch (authError) {
          settings.set('google-auth', null)
				}
      }
      evt.sender.send('receive-google-connected', false)
		}
	}

	ipcMain.on('fetch-google-photos-images', (evt, nextPageToken) => {
		fetchImages(evt, nextPageToken)
	})

	ipcMain.on("request-google-photos-auth", (evt, arg) => {
		authApi.getAccessToken().then(auth => {
			settings.set('google-auth', auth)
			evt.sender.send('receive-google-connected', true)
			fetchImages(evt, null)
		})
	})

	ipcMain.on("disconnect-google-photos-auth", (evt, arg) => {
		settings.delete('google-auth')
		evt.sender.send('receive-google-connected', false)
	})	
}
