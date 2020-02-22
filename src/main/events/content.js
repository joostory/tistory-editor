const AuthenticationManager = require('../lib/AuthenticationManager')
const { ipcMain, clipboard } = require('electron')
const dateformat = require('dateformat')
const ProviderApiManager = require('../lib/ProviderApiManager')

module.exports = () => {
	ipcMain.on("fetch-posts", (evt, authUUID, blogName, options) => {
    let auth = AuthenticationManager.findByUUID(authUUID)
    let api = ProviderApiManager.getApi(auth.provider)
		if (!api.validateAuthInfo(auth.authInfo)) {
      evt.sender.send('receive-message', '글 목록을 불러오지 못했습니다.')
      evt.sender.send('receive-posts-failed')
			return
    }
    
    api.fetchPosts(auth.authInfo, blogName, options)
      .then(posts => {
        evt.sender.send('receive-posts', posts)
      })
      .catch(err => {
        evt.sender.send('receive-message', '글 목록을 불러오지 못했습니다.')
        evt.sender.send('receive-posts-failed')
      })
  })
  
  ipcMain.on("fetch-content", (evt, authUUID, blogName, postId) => {
    let auth = AuthenticationManager.findByUUID(authUUID)
    if (auth.provider != 'tistory') {
      evt.sender.send('receive-message', '글 정보를 불러오지 못했습니다.')
      return
    }

    let api = ProviderApiManager.getApi(auth.provider)
		api.fetchPost(auth.authInfo, blogName, postId).then(res => {
			evt.sender.send('receive-content', res.post)
		}).catch(err => {
			console.error(err)
			evt.sender.send('receive-message', '글 정보를 불러오지 못했습니다.')
		})
	})
	
	ipcMain.on("save-content", (evt, authUUID, blogName, post) => {
    let auth = AuthenticationManager.findByUUID(authUUID)
    let api = ProviderApiManager.getApi(auth.provider)
		let messagePrefix = dateformat(new Date(), 'HH:MM:ss : ')

		if (!api.validateAuthInfo(auth.authInfo)) {
			evt.sender.send('finish-save-content')
			evt.sender.send('receive-message', messagePrefix + '글을 수정하지 못했습니다.')
			return
    }
    
    api.savePost(auth.authInfo, blogName, post)
      .then(res => {
        evt.sender.send('finish-save-content', res.post)
        evt.sender.send('receive-message', messagePrefix + ' 수정완료')
      })
      .catch(err => {
        console.error(err)
        evt.sender.send('finish-save-content')
        evt.sender.send('receive-message', messagePrefix + '글을 수정하지 못했습니다.')
      })
	})

	ipcMain.on("add-content", (evt, authUUID, blogName, post) => {
    let auth = AuthenticationManager.findByUUID(authUUID)
    let api = ProviderApiManager.getApi(auth.provider)
    let messagePrefix = dateformat(new Date(), 'HH:MM:ss : ')
    
		if (!api.validateAuthInfo(auth.authInfo)) {
			evt.sender.send('finish-add-content')
			evt.sender.send('receive-message', messagePrefix + '글을 발행하지 못했습니다.')
			return
    }
    
    api.addPost(auth.authInfo, blogName, post)
      .then(res => {
        evt.sender.send('finish-add-content', res.post)
        evt.sender.send('receive-message', messagePrefix + '발행 완료')
      })
      .catch(err => {
        console.error(err)
        evt.sender.send('finish-add-content')
        evt.sender.send('receive-message', messagePrefix + '글을 발행하지 못했습니다.')
      })
  })
  
  ipcMain.on("add-file", async (evt, authUUID, blogName, filedata, options) => {
		let auth = AuthenticationManager.findByUUID(authUUID)
    let api = ProviderApiManager.getApi(auth.provider)

		evt.sender.send('start-add-file')
		try {
			if (!api.validateAuthInfo(auth.authInfo)) {
				throw new Error("NO_AUTH")
      }
      
      const filebuffer = Buffer.from(filedata.split('base64,')[1], 'base64');
			const uploadUrl = await api.uploadFileWithBuffer(auth.authInfo, blogName, filebuffer, {
        filename: options.name,
        contentType: options.type,
        knownLength: options.size
      })
			evt.sender.send('finish-add-file', uploadUrl)
			evt.sender.send('receive-message', '이미지 업로드 완료')
		} catch (e) {
			console.error("uploadFile error", e)
			evt.sender.send('finish-add-file')
			evt.sender.send('receive-message', '이미지 업로드 실패')
		}
	})

	ipcMain.on("add-clipboard-image", async (evt, authUUID, blogName) => {
    let auth = AuthenticationManager.findByUUID(authUUID)
    let api = ProviderApiManager.getApi(auth.provider)

		evt.sender.send('start-add-file')
		try {
			if (!api.validateAuthInfo(auth.authInfo)) {
				throw new Error("NO_AUTH")
      }
      
			let image = clipboard.readImage()
			if (image.isEmpty()) {
				throw new Error("NO_IMAGE")
			}
			const imageBuffer = image.toPNG()
			const uploadUrl = await api.uploadFileWithBuffer(auth.authInfo, blogName, imageBuffer, {
				filename: 'clipboard.png',
				contentType: 'image/png',
				knownLength: imageBuffer.length
			})
			evt.sender.send('finish-add-file', uploadUrl)
			evt.sender.send('receive-message', '클립보드 이미지 업로드 완료')

		} catch(e) {
			console.error("uploadFile error", e)
			evt.sender.send('finish-add-file')
			evt.sender.send('receive-message', '클립보드 이미지 업로드 실패')
		}
	})

	ipcMain.on("add-image-url", async (evt, authUUID, blogName, url, filename) => {
		let auth = AuthenticationManager.findByUUID(authUUID)
    let api = ProviderApiManager.getApi(auth.provider)

		evt.sender.send('start-add-file')
		try {
			if (!api.validateAuthInfo(auth.authInfo)) {
				throw new Error("NO AUTH")
			}

			const res = await fetch(url)
			if (!res.ok) {
				throw new Error(`FETCH_ERROR:${res.status} ${res.statusText}`)
			}
			const contentType = res.headers.get('content-type')
			const length = res.headers.get('content-length')
			const buffer = await res.buffer()

			const uploadUrl = await api.uploadFileWithBuffer(auth.authInfo, blogName, buffer, {
				filename: filename,
				contentType: contentType,
				knownLength: length
			})

			evt.sender.send('finish-add-file', uploadUrl)
			evt.sender.send('receive-message', '이미지 업로드 완료')
		} catch (e) {
			console.error("uploadFile error", e.message)
			evt.sender.send('finish-add-file')
			evt.sender.send('receive-message', '이미지 업로드 실패')
		}
	})

}
