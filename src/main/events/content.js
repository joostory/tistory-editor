const AuthenticationManager = require('../lib/AuthenticationManager')
const { ipcMain } = require('electron')
const dayjs = require('dayjs')
const ProviderApiManager = require('../lib/ProviderApiManager')
const NpfConverter = require('../lib/NpfConverter')

module.exports = () => {
  ipcMain.handle("convert-content", async (evt, { content, from, to }) => {
    console.log('Main.handle: convert-content', { from, to })
    if (from === 'json' && to === 'markdown') {
      const npf = NpfConverter.tiptapToNpf(content)
      return NpfConverter.npfToMarkdown(npf)
    } else if (from === 'markdown' && to === 'json') {
      const npf = NpfConverter.markdownToNpf(content)
      return NpfConverter.npfToTiptap(npf)
    }
    return content
  })
  ipcMain.on("fetch-categories", (evt, authUUID, blogName) => {
    console.log('Main.receive: fetch-categories', authUUID, blogName)
    let auth = AuthenticationManager.findByUUID(authUUID)
    let api = ProviderApiManager.getApi(auth.provider)
		if (auth.provider != 'tistory' || !api.validateAuthInfo(auth.authInfo)) {
      return
    }

    api.fetchCategories(auth.authInfo, blogName)
      .then(categories => {
        evt.sender.send('receive-categories', categories)
      })
  })

	ipcMain.on("fetch-posts", (evt, authUUID, blogName, options) => {
    console.log('Main.receive: fetch-posts', authUUID, blogName, options)
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
    console.log('Main.receive: fetch-content', authUUID, blogName, postId)
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
    console.log('Main.receive: save-content', authUUID, blogName, post)
    let auth = AuthenticationManager.findByUUID(authUUID)
    let api = ProviderApiManager.getApi(auth.provider)
    let messagePrefix = dayjs().format('HH:mm:ss : ')

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
    console.log('Main.receive: add-content', authUUID, blogName, post)
    let auth = AuthenticationManager.findByUUID(authUUID)
    let api = ProviderApiManager.getApi(auth.provider)
    let messagePrefix = dayjs().format('HH:mm:ss : ')
    
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


}
