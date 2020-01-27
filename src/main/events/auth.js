const settings = require('electron-settings')
const { ipcMain } = require('electron')
const tumblr = require("../apis/tumblr-api")

const fetchUser = (evt, auth) => {
  evt.sender.send('start-fetch-user', {})
  tumblr.fetchUser(auth)
    .then(res => {
      evt.sender.send('initialized', [])
      evt.sender.send('receive-user', res.user)
      evt.sender.send('receive-blogs', [].concat(res.user.blogs))
    })
    .catch(err => {
      evt.sender.send('initialized', [])
      evt.sender.send('end-fetch-user', {})
      evt.sender.send('receive-message', '사용자 정보를 불러오지 못했습니다.')
    })
}

module.exports = () => {
	ipcMain.on('fetch-initial-data', (evt) => {
    let auth = settings.get('auth')
		if (auth && auth.token) {
			fetchUser(evt, auth)
		} else {
			evt.sender.send('initialized', [])
		}
	})

	ipcMain.on("fetch-user", (evt) => {
		let auth = settings.get('auth')
		if (!auth || !auth.token) {
			return
		}

		fetchUser(evt, auth)
	})
	
	ipcMain.on("fetch-blogs", (evt) => {
		let auth = settings.get('auth')
		if (!auth || !auth.toekn) {
			return
		}

		fetchBlogs(evt, auth)
	})
	
	ipcMain.on("request-auth", (evt, arg) => {
    tumblr.getAccessToken()
      .then(auth => {
        settings.set('auth', auth)
        fetchUser(evt, auth)
      })
	})
	
	ipcMain.on("disconnect-auth", (evt, arg) => {
		settings.set("auth", {})
		evt.sender.send('complete-disconnect-auth')
		evt.sender.send('receive-message', '인증해제 했습니다.')
	})	
}
