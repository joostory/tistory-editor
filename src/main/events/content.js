const settings = require('electron-settings')
const { ipcMain } = require('electron')
const dateformat = require('dateformat')
const tumblr = require("../apis/tumblr-api")

module.exports = () => {
	ipcMain.on("fetch-posts", (evt, blogName, offset) => {
		let auth = settings.get('auth')
		if (!auth || !auth.token) {
			console.log("fetch-posts auth error")
			return
    }
    
    tumblr.fetchPosts(auth, blogName, offset)
      .then(res => {
        evt.sender.send('receive-posts', {
          posts: res.posts? [].concat(res.posts) : [],
          hasNext: res.blog.posts > offset + res.posts.length
        })
      })
      .catch(err => {
        console.error("fetch-posts error", err)
        evt.sender.send('receive-message', '글 목록을 불러오지 못했습니다.')
        evt.sender.send('receive-posts-failed')
      })
	})
	
	ipcMain.on("save-content", (evt, blogName, post) => {
		let auth = settings.get('auth')
		let messagePrefix = dateformat(new Date(), 'HH:MM:ss : ')

		if (!auth || !auth.token) {
			evt.sender.send('finish-save-content')
			evt.sender.send('receive-message', messagePrefix + '글을 수정하지 못했습니다.')
			return
		}

    tumblr.savePost(auth, blogName, post)
      .then(async res => {
        let postResponse = await tumblr.fetchPost(auth, blogName, res.id)
        evt.sender.send('finish-save-content', postResponse.posts[0])
        evt.sender.send('receive-message', messagePrefix + ' 수정완료')
      })
      .catch(err => {
        console.error(err)
        evt.sender.send('finish-save-content')
        evt.sender.send('receive-message', messagePrefix + '글을 수정하지 못했습니다.')
      })
	})

	ipcMain.on("add-content", (evt, blogName, post) => {
		let auth = settings.get('auth')
		let messagePrefix = dateformat(new Date(), 'HH:MM:ss : ')

		if (!auth || !auth.token) {
			evt.sender.send('finish-add-content')
			evt.sender.send('receive-message', messagePrefix + '글을 발행하지 못했습니다.')
			return
    }
    
    tumblr.addPost(auth, blogName, post)
      .then(async res => {
        let postResponse = await tumblr.fetchPost(auth, blogName, res.id)
        evt.sender.send('finish-add-content', postResponse.posts[0])
        evt.sender.send('receive-message', messagePrefix + '발행 완료')
      })
      .catch(err => {
        console.error(err)
        evt.sender.send('finish-add-content')
        evt.sender.send('receive-message', messagePrefix + '글을 발행하지 못했습니다.')
      })
	})

}
