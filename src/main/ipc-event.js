const storage = require('electron-json-storage')
const {ipcMain} = require('electron')
const tistory = require('./tistory-api')

const init = () => {
	const fetchInfoErrorHandler = (evt, err) => {
		console.error(err)
		evt.sender.send('receive-info', {})
	}

	const fetchInfo = (evt, auth) => {
		tistory.fetchBlogInfo(auth).then(res => {
			if (!res.tistory || res.tistory.status != 200) {
				throw "Error:" + res.tistory.status
			}

			evt.sender.send('receive-info', {
				id: res.tistory.id,
				blogs: res.tistory.item
			})
		}).catch(err => {
			fetchInfoErrorHandler(evt, err)
		})
	}

	ipcMain.on("fetch-info", (evt) => {
		console.log("fetch-info")
	  storage.get("auth", (error, auth) => {
	    if (error) throw error

			if (!auth || !auth.access_token) {
				fetchInfoErrorHandler(evt, "no auth")
				return
			}

			fetchInfo(evt, auth)
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
