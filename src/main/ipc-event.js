const storage = require('electron-json-storage')
const {ipcMain, clipboard} = require('electron')
const dateformat = require('dateformat')
const tistory = require('./tistory-api')

module.exports.init = () => {
	const fetchUser = (evt, auth) => {
		tistory.fetchUser(auth).then(res => {
			evt.sender.send('receive-user', res.tistory.item)
		}).catch(err => {
			console.error(err)
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

	ipcMain.on("fetch-user", (evt) => {
	  storage.get("auth", (error, auth) => {
	    if (error) throw error

			if (!auth || !auth.access_token) {
				return
			}

			fetchUser(evt, auth)
	  })
	})

	ipcMain.on("fetch-blogs", (evt) => {
	  storage.get("auth", (error, auth) => {
	    if (error) throw error

			if (!auth || !auth.access_token) {
				return
			}

			fetchBlogs(evt, auth)
	  })
	})

	ipcMain.on("fetch-posts", (evt, blogName, page) => {
		storage.get("auth", (error, auth) => {
			if (error) throw error

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
	})

	ipcMain.on("fetch-categories", (evt, blogName) => {
		storage.get("auth", (error, auth) => {
			if (error) throw error

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
	})

	ipcMain.on("fetch-content", (evt, blogName, postId) => {
		storage.get("auth", (error, auth) => {
			if (error) throw error

			if (!auth || !auth.access_token) {
				return
			}

			tistory.fetchContent(auth, blogName, postId).then(res => {
				evt.sender.send('receive-content', res.tistory.item)
			}).catch(err => {
				console.error(err)
				evt.sender.send('receive-message', '글 정보를 불러오지 못했습니다.')
			})
		})
	})

	ipcMain.on("save-content", (evt, blogName, post) => {
		storage.get("auth", (error, auth) => {
			if (error) throw error

			let publishType = post.visibility > 1 ? '발행' : '저장'
			let messagePrefix = dateformat(new Date(), 'HH:MM:ss : ')

			if (!auth || !auth.access_token) {
				evt.sender.send('finish-save-content')
				evt.sender.send('receive-message', messagePrefix + '글을 ' + publishType + '하지 못했습니다.')
				return
			}

			tistory.saveContent(auth, blogName, post).then(res => {
				evt.sender.send('finish-save-content', res.tistory.postId)
				evt.sender.send('receive-message', '\'' + post.title + '\' ' + publishType + ' 완료')
			}).catch(err => {
				console.error(err)
				evt.sender.send('finish-save-content')
				evt.sender.send('receive-message', messagePrefix + '글을 ' + publishType + '하지 못했습니다.')
			})
		})
	})

	ipcMain.on("add-content", (evt, blogName, post) => {
		storage.get("auth", (error, auth) => {
			if (error) throw error

			let publishType = post.visibility > 1 ? '발행' : '저장'
			let messagePrefix = dateformat(new Date(), 'HH:MM:ss : ')

			if (!auth || !auth.access_token) {
				evt.sender.send('finish-add-content')
				evt.sender.send('receive-message', messagePrefix + '글을 ' + publishType + '하지 못했습니다.')
				return
			}

			tistory.addContent(auth, blogName, post).then(res => {
				evt.sender.send('finish-add-content', res.tistory.postId)
				evt.sender.send('receive-message', '\'' + post.title + '\' ' + publishType + ' 완료')
			}).catch(err => {
				console.error(err)
				evt.sender.send('finish-add-content')
				evt.sender.send('receive-message', messagePrefix + '글을 ' + publishType + '하지 못했습니다.')
			})
		})
	})

	ipcMain.on("add-file", (evt, blogName, filepath) => {
		storage.get("auth", (error, auth) => {
			if (error) throw error

			if (!auth || !auth.access_token) {
				evt.sender.send('finish-add-file')
				return
			}

			tistory.uploadFile(auth, blogName, filepath).then(res => {
				evt.sender.send('finish-add-file', res.tistory.url)
				evt.sender.send('receive-message', '이미지 업로드 완료')
			}).catch(err => {
				console.error("uploadFile error", err)
				evt.sender.send('finish-add-file')
				evt.sender.send('receive-message', '이미지 업로드 실패')
			})
		})
	})

	ipcMain.on("add-clipboard-image", (evt, blogName) => {
		storage.get("auth", (error, auth) => {
			if (error) throw error

			if (!auth || !auth.access_token) {
				evt.sender.send('finish-add-file')
				return
			}

			let image = clipboard.readImage()
			if (image.isEmpty()) {
				return
			}

			tistory.uploadFileWithImage(auth, blogName, image).then(res => {
				evt.sender.send('finish-add-file', res.tistory.url)
				evt.sender.send('receive-message', '클립보드 이미지 업로드 완료')
			}).catch(err => {
				console.error("uploadFile error", err)
				evt.sender.send('finish-add-file')
				evt.sender.send('receive-message', '클립보드 이미지 업로드 실패')
			})
		})
	})

	ipcMain.on("request-auth", (evt, arg) => {
	  tistory.getAccessToken(auth => {
	    storage.set("auth", auth)
	    fetchUser(evt, auth)
			fetchBlogs(evt, auth)
		}).catch(e => {
			console.error(e)
		})
	})

	ipcMain.on("disconnect-auth", (evt, arg) => {
    storage.set("auth", {})
    evt.sender.send('complete-disconnect-auth')
		evt.sender.send('receive-message', '인증해제 했습니다.')
	})

	ipcMain.on("fetch-preferences", (evt) => {
		storage.get("preferences", (error, data) => {
			if (error || !data) {
				data = {}
			}
			evt.sender.send("receive-preferences", data)
		})
	})

	ipcMain.on("save-preferences", (evt, preferences) => {
		storage.set("preferences", preferences)
		evt.sender.send("receive-preferences", preferences)
	})
}
