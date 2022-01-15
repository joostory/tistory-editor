const { ipcMain } = require('electron')
const settings = require('electron-settings')
const { GoogleAuthApi, PhotosApi } = require('../apis/photos-api')

module.exports = () => {
	const authApi = new GoogleAuthApi()
	const fetchImages = async (evt, nextPageToken) => {
		console.log('fetchImage', nextPageToken)
		const auth = settings.getSync('google-auth')

		try {
			if (!auth || !auth.access_token) {
				throw new Error("NO_AUTH")
			}
			evt.sender.send('start-fetch-google-photos-images')
      const photosApi = new PhotosApi(auth)
      const data = await photosApi.fetchMediaItems(100, nextPageToken)
      evt.sender.send('receive-google-photos-images', data)

		} catch(e) {
			console.error(e)
			if (auth && auth.refresh_token) {
				try {
					const refreshAuth = await authApi.refreshToken(auth.refresh_token)
					settings.setSync('google-auth', refreshAuth)
          fetchImages(evt, nextPageToken)
          return
				} catch (authError) {
          settings.setSync('google-auth', null)
          evt.sender.send('receive-google-connected', false)
				}
      } else {
        evt.sender.send('receive-google-connected', false)
      }
      evt.sender.send('receive-google-photos-images', null)
		}
	}

	ipcMain.on('fetch-google-photos-images', (evt, nextPageToken) => {
    console.log('Main.receive: fetch-google-photos-images', nextPageToken)
		fetchImages(evt, nextPageToken)
	})

	ipcMain.on("request-google-photos-auth", (evt, arg) => {
    console.log('Main.receive: request-google-photos-auth')
    authApi.requestAuth((auth) => {
      settings.setSync('google-auth', auth)
			evt.sender.send('receive-google-connected', true)
			fetchImages(evt, null)//
    }, (e) => {
      console.error(e)
      evt.sender.send('receive-message', `오류가 발생했습니다. (${e.message})`)
    })
	})

	ipcMain.on("disconnect-google-photos-auth", (evt, arg) => {
    console.log('Main.receive: disconnect-google-photos-auth')
		settings.unsetSync('google-auth')
		evt.sender.send('receive-google-connected', false)
	})	
}
