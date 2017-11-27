const settings = require('electron-settings')
const { ipcMain, clipboard } = require('electron')
const dateformat = require('dateformat')
const tistory = require('../tistory-api')

const fetchUser = (evt, auth) => {
	evt.sender.send('start-fetch-user', {})
	tistory.fetchUser(auth).then(res => {
		evt.sender.send('initialized', [])
		evt.sender.send('receive-user', res.tistory.item)
	}).catch(err => {
		console.error(err)
		evt.sender.send('initialized', [])
		evt.sender.send('end-fetch-user', {})
		evt.sender.send('receive-message', '사용자 정보를 불러오지 못했습니다.')
	})
}

const fetchBlogs = (evt, auth) => {
	tistory.fetchBlogInfo(auth).then(res => {
		evt.sender.send('receive-blogs', [].concat(res.tistory.item.blogs))
	}).catch(err => {
		console.error(err)
		evt.sender.send('receive-blogs', [])
		evt.sender.send('receive-message', '블로그 리스트를 불러오지 못했습니다.')
	})
}

module.exports = () => {
	ipcMain.on('fetch-initial-data', (evt) => {
		let auth = settings.get('auth')
		if (auth && auth.access_token) {
			fetchUser(evt, auth)
			fetchBlogs(evt, auth)
		} else {
			evt.sender.send('initialized', [])
		}
	})

	ipcMain.on("fetch-user", (evt) => {
		let auth = settings.get('auth')
		if (!auth || !auth.access_token) {
			return
		}

		fetchUser(evt, auth)
	})
	
	ipcMain.on("fetch-blogs", (evt) => {
		let auth = settings.get('auth')
		if (!auth || !auth.access_token) {
			return
		}

		fetchBlogs(evt, auth)
	})
	
	ipcMain.on("request-auth", (evt, arg) => {
		tistory.getAccessToken().then(auth => {
			settings.set('auth', auth)
			fetchUser(evt, auth)
			fetchBlogs(evt, auth)
		}).catch(e => {
			console.error(e)
		})
	})
	
	ipcMain.on("disconnect-auth", (evt, arg) => {
		settings.set("auth", {})
		evt.sender.send('complete-disconnect-auth')
		evt.sender.send('receive-message', '인증해제 했습니다.')
	})	
}
