const storage = require('electron-json-storage')
const {ipcMain} = require('electron')
const tistory = require('./tistory-api')

const init = () => {
	ipcMain.on("fetch-info", (e, arg) => {
	  storage.get("auth", (error, auth) => {
	    if (error) throw error

	    if (auth && auth.access_token) {
	      tistory.fetchBlogInfo(auth).then(res => {
	        if (res.tistory && res.tistory.status == 200) {
	          let info = {
	            id: res.tistory.id,
	            blogs: res.tistory.item
	          }
	          e.sender.send('receive-info', info)
	        }
	      }).catch(err => {
	        console.error(auth, err)
	        e.sender.send('receive-info', null)
	      })
	    }
	  })
	})

	ipcMain.on("request-auth", (e, arg) => {
	  tistory.getAccessToken(auth => {
	    storage.set("auth", auth)
	    tistory.fetchBlogInfo(auth).then(info => {
	      e.sender.send('receive-info', auth)
	    }).catch(err => {
	      console.error(auth, err)
	      e.sender.send('receive-info', null)
	    })
	  })
	})
}

module.exports = {
	init: init
}
