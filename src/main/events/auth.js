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
	
	ipcMain.on("fetch-posts", (evt, blogName, page) => {
		let auth = settings.get('auth')
		if (!auth || !auth.access_token) {
			console.log("fetch-posts auth error")
			return
		}

		tistory.fetchPosts(auth, blogName, page).then(res => {
			evt.sender.send('receive-posts', {
				page: res.tistory.item.page,
				posts: [].concat(res.tistory.item.posts),
				hasNext: res.tistory.item.totalCount > res.tistory.item.page * res.tistory.item.count
			})
		}).catch(err => {
			console.error("fetch-posts error", err)
			evt.sender.send('receive-message', '글 목록을 불러오지 못했습니다.')
			evt.sender.send('receive-posts-failed')
		})
	})
	
	ipcMain.on("fetch-categories", (evt, blogName) => {
		let auth = settings.get('auth')
			if (!auth || !auth.access_token) {
			evt.sender.send('receive-categories', [])
			return
		}

		tistory.fetchCategories(auth, blogName).then(res => {
			let categories = []
			if (res.tistory.item.categories) {
				categories = [].concat(res.tistory.item.categories).map(category => {
					return {
						'id': category.id,
						'parent': category.parent,
						'label': category.label
					}
				})
			}

			evt.sender.send('receive-categories', categories)
		}).catch(err => {
			console.error(err)
			evt.sender.send('receive-categories', [])
		})
	})
	
	ipcMain.on("request-auth", (evt, arg) => {
		tistory.getAccessToken(auth => {
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
