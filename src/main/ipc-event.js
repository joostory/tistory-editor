const storage = require('electron-json-storage')
const {ipcMain} = require('electron')
const tistory = require('./tistory-api')

const init = () => {
	const fetchUser = (evt, auth) => {
		tistory.fetchUser(auth).then(res => {
			if (!res.tistory || res.tistory.status != 200) {
				throw "Error:" + res.tistory.status
			}
			evt.sender.send('receive-user', res.tistory.item)
		}).catch(err => {
			evt.sender.send('receive-user', {})
		})
	}

	const fetchBlogs = (evt, auth) => {
		tistory.fetchBlogInfo(auth).then(res => {
			if (!res.tistory || res.tistory.status != 200) {
				throw "Error:" + res.tistory.status
			}

			evt.sender.send('receive-blogs', res.tistory.item.blogs)
		}).catch(err => {
			evt.sender.send('receive-blogs', [])
		})
	}

	ipcMain.on("fetch-user", (evt) => {
		console.log("fetch-user")
	  storage.get("auth", (error, auth) => {
	    if (error) throw error

			if (!auth || !auth.access_token) {
				evt.sender.send('receive-user', {})
				return
			}

			fetchUser(evt, auth)
	  })
	})

	ipcMain.on("fetch-blogs", (evt) => {
		console.log("fetch-blogs")
	  storage.get("auth", (error, auth) => {
	    if (error) throw error

			if (!auth || !auth.access_token) {
				evt.sender.send('receive-user', {})
				return
			}

			fetchBlogs(evt, auth)
	  })
	})

	ipcMain.on("request-auth", (evt, arg) => {
		console.log("request-auth")
	  tistory.getAccessToken(auth => {
	    storage.set("auth", auth)
	    fetchInfo(evt, auth)
	  }).catch(err => {
			fetchInfoErrorHandler(evt, err)
		})
	})

	ipcMain.on("disconnect-auth", (evt, arg) => {
		console.log("disconnect-auth")
    storage.set("auth", {})
    evt.sender.send('receive-info', {})
	})
}

module.exports = {
	init: init
}
