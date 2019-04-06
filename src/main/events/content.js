const settings = require('electron-settings')
const { ipcMain, clipboard } = require('electron')
const dateformat = require('dateformat')
const fetch = require('node-fetch')
const tistory = require('../apis/tistory-api')

module.exports = () => {
	ipcMain.on("fetch-posts", (evt, blogName, page) => {
		let auth = settings.get('auth')
		if (!auth || !auth.access_token) {
			console.log("fetch-posts auth error")
			return
		}

		tistory.fetchPosts(auth, blogName, page).then(res => {
			evt.sender.send('receive-posts', {
				page: res.tistory.item.page,
				posts: res.tistory.item.posts? [].concat(res.tistory.item.posts) : [],
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

	ipcMain.on("fetch-content", (evt, blogName, postId) => {
		let auth = settings.get('auth')
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

	ipcMain.on("save-content", (evt, blogName, post) => {
		let auth = settings.get('auth')
		let publishType = post.visibility > 1 ? '발행' : '저장'
		let messagePrefix = dateformat(new Date(), 'HH:MM:ss : ')

		if (post.title.length == 0) {
			evt.sender.send('finish-save-content')
			evt.sender.send('receive-message', messagePrefix + '제목을 입력해주세요.')
			return
		}

		if (!auth || !auth.access_token) {
			evt.sender.send('finish-save-content')
			evt.sender.send('receive-message', messagePrefix + '글을 ' + publishType + '하지 못했습니다.')
			return
		}

		tistory.saveContent(auth, blogName, post).then(res => {
			evt.sender.send('finish-save-content', res.tistory.postId, res.tistory.url)
			evt.sender.send('receive-message', '\'' + post.title + '\' ' + publishType + ' 완료')
		}).catch(err => {
			console.error(err)
			evt.sender.send('finish-save-content')
			evt.sender.send('receive-message', messagePrefix + '글을 ' + publishType + '하지 못했습니다.')
		})
	})

	ipcMain.on("add-content", (evt, blogName, post) => {
		let auth = settings.get('auth')
		let publishType = post.visibility > 1 ? '발행' : '저장'
		let messagePrefix = dateformat(new Date(), 'HH:MM:ss : ')

		if (post.title.length == 0) {
			evt.sender.send('finish-save-content')
			evt.sender.send('receive-message', messagePrefix + '제목을 입력해주세요.')
			return
		}

		if (!auth || !auth.access_token) {
			evt.sender.send('finish-add-content')
			evt.sender.send('receive-message', messagePrefix + '글을 ' + publishType + '하지 못했습니다.')
			return
		}

		tistory.addContent(auth, blogName, post).then(res => {
			evt.sender.send('finish-add-content', res.tistory.postId, res.tistory.url)
			evt.sender.send('receive-message', '\'' + post.title + '\' ' + publishType + ' 완료')
		}).catch(err => {
			console.error(err)
			evt.sender.send('finish-add-content')
			evt.sender.send('receive-message', messagePrefix + '글을 ' + publishType + '하지 못했습니다.')
		})
	})

	ipcMain.on("add-file", async (evt, blogName, filedata, options) => {
		let auth = settings.get('auth')
		evt.sender.send('start-add-file')
		
		try {
			if (!auth || !auth.access_token) {
				throw new Error("NO_AUTH")
      }
      
      const filebuffer = Buffer.from(filedata.split('base64,')[1], 'base64');
			const res = await tistory.uploadFileWithBuffer(auth, blogName, filebuffer, {
        filename: options.name,
        contentType: options.type,
        knownLength: options.size
      })
			evt.sender.send('finish-add-file', res.tistory.url)
			evt.sender.send('receive-message', '이미지 업로드 완료')
		} catch (e) {
			console.error("uploadFile error", e)
			evt.sender.send('finish-add-file')
			evt.sender.send('receive-message', '이미지 업로드 실패')
		}
	})

	ipcMain.on("add-clipboard-image", async (evt, blogName) => {
		let auth = settings.get('auth')
		evt.sender.send('start-add-file')

		try {
			if (!auth || !auth.access_token) {
				throw new Error("NO_AUTH")
			}
			let image = clipboard.readImage()
			if (image.isEmpty()) {
				throw new Error("NO_IMAGE")
			}
			const imageBuffer = image.toPNG()
			const res = await tistory.uploadFileWithBuffer(auth, blogName, imageBuffer, {
				filename: 'clipboard.png',
				contentType: 'image/png',
				knownLength: imageBuffer.length
			})
			evt.sender.send('finish-add-file', res.tistory.url)
			evt.sender.send('receive-message', '클립보드 이미지 업로드 완료')

		} catch(e) {
			console.error("uploadFile error", e)
			evt.sender.send('finish-add-file')
			evt.sender.send('receive-message', '클립보드 이미지 업로드 실패')
		}
	})

	ipcMain.on("add-image-url", async (evt, blogName, url, filename) => {
		let auth = settings.get('auth')
		evt.sender.send('start-add-file')

		try {
			if (!auth || !auth.access_token) {
				throw new Error("NO AUTH")
			}

			const res = await fetch(url)
			if (!res.ok) {
				throw new Error(`FETCH_ERROR:${res.status} ${res.statusText}`)
			}
			const contentType = res.headers.get('content-type')
			const length = res.headers.get('content-length')
			const buffer = await res.buffer()

			const uploadRes = await tistory.uploadFileWithBuffer(auth, blogName, buffer, {
				filename: filename,
				contentType: contentType,
				knownLength: length
			})

			evt.sender.send('finish-add-file', uploadRes.tistory.url)
			evt.sender.send('receive-message', '이미지 업로드 완료')
		} catch (e) {
			console.error("uploadFile error", e.message)
			evt.sender.send('finish-add-file')
			evt.sender.send('receive-message', '이미지 업로드 실패')
		}
	})
}
