const storage = require('electron-json-storage')
const {ipcMain} = require('electron')
const tistory = require('./tistory-api')

const init = () => {
	const fetchUser = (evt, auth) => {
		console.log("fetchUser", auth)
		tistory.fetchUser(auth).then(res => {
			evt.sender.send('receive-user', res.tistory.item)
		}).catch(err => {
			console.error(err)
			evt.sender.send('receive-user', {})
		})
	}

	const fetchBlogs = (evt, auth) => {
		console.log("fetchBlogs", auth)
		tistory.fetchBlogInfo(auth).then(res => {
			evt.sender.send('receive-blogs', res.tistory.item.blogs)
		}).catch(err => {
			console.error(err)
			evt.sender.send('receive-blogs', [])
		})
	}

	const fetchPosts = (evt, auth, blogName) => {
		console.log("fetchPosts", auth)
		tistory.fetchPosts(auth, blogName).then(res => {
			evt.sender.send('receive-posts', res.tistory.item.posts)
		}).catch(err => {
			console.error(err)
			evt.sender.send('receive-posts', [])
		})
	}

	const fetchContent = (evt, auth, blogName, postId) => {
		console.log("fetchContent", auth)
		tistory.fetchContent(auth, blogName, postId).then(res => {
			evt.sender.send('receive-content', res.tistory.item)
		}).catch(err => {
			console.error(err)
			evt.sender.send('receive-content', {})
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

	ipcMain.on("fetch-posts", (evt, blogName) => {
		console.log("fetch-posts")
		storage.get("auth", (error, auth) => {
			if (error) throw error

			if (!auth || !auth.access_token) {
				evt.sender.send('receive-user', {})
				return
			}

			fetchPosts(evt, auth, blogName)
		})
	})

	ipcMain.on("fetch-content", (evt, blogName, postId) => {
		console.log("fetch-content", blogName, postId)
		storage.get("auth", (error, auth) => {
			if (error) throw error

			if (!auth || !auth.access_token) {
				evt.sender.send('receive-content', {})
				return
			}

			fetchContent(evt, auth, blogName, postId)
		})
	})

	ipcMain.on("request-auth", (evt, arg) => {
		console.log("request-auth")
	  tistory.getAccessToken(auth => {
	    storage.set("auth", auth)
	    fetchUser(evt, auth)
			fetchBlogs(evt, auth)
		})
	})

	ipcMain.on("disconnect-auth", (evt, arg) => {
		console.log("disconnect-auth")
    storage.set("auth", {})
    evt.sender.send('receive-user', {})
	})
}

module.exports = {
	init: init
}
