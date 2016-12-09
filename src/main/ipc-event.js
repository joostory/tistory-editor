const storage = require('electron-json-storage')
const {ipcMain} = require('electron')
const tistory = require('./tistory-api')

module.exports.init = () => {
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

	ipcMain.on("fetch-posts", (evt, blogName, page) => {
		console.log("fetch-posts")
		storage.get("auth", (error, auth) => {
			if (error) throw error

			if (!auth || !auth.access_token) {
				evt.sender.send('receive-posts', [])
				return
			}

			tistory.fetchPosts(auth, blogName, page).then(res => {
				evt.sender.send('receive-posts', res.tistory.item.posts)
			}).catch(err => {
				console.error(err)
				evt.sender.send('receive-posts', [])
			})
		})
	})

	ipcMain.on("fetch-categories", (evt, blogName) => {
		console.log("fetch-categories")
		storage.get("auth", (error, auth) => {
			if (error) throw error

			if (!auth || !auth.access_token) {
				evt.sender.send('receive-categories', [])
				return
			}

			tistory.fetchCategories(auth, blogName).then(res => {
				let categories = res.tistory.item.categories.map(category => {
					return {
						'id': category.id,
						'parent': category.parent,
						'label': category.label
					}
				})

				evt.sender.send('receive-categories', categories)
			}).catch(err => {
				console.error(err)
				evt.sender.send('receive-categories', [])
			})
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

			tistory.fetchContent(auth, blogName, postId).then(res => {
				evt.sender.send('receive-content', res.tistory.item)
			}).catch(err => {
				console.error(err)
				evt.sender.send('receive-content', {})
			})
		})
	})

	ipcMain.on("request-auth", (evt, arg) => {
		console.log("request-auth")
	  tistory.getAccessToken(auth => {
			console.log("getToken", auth)
	    storage.set("auth", auth)
	    fetchUser(evt, auth)
			fetchBlogs(evt, auth)
		}).catch(e => {
			console.log(e)
		})
	})

	ipcMain.on("disconnect-auth", (evt, arg) => {
		console.log("disconnect-auth")
    storage.set("auth", {})
    evt.sender.send('receive-user', {})
	})
}
