const settings = require('electron-settings')
const { ipcMain, clipboard } = require('electron')
const dateformat = require('dateformat')
const tistory = require('../tistory-api')

module.exports = () => {
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

	ipcMain.on("add-file", (evt, blogName, filepath) => {
		let auth = settings.get('auth')
		evt.sender.send('start-add-file')
		
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

	ipcMain.on("add-clipboard-image", (evt, blogName) => {
		let auth = settings.get('auth')
		evt.sender.send('start-add-file')

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
}
