import { ipcRenderer } from 'electron'
import {
	initialized,
	startFetchUser,
	endFetchUser,
	receiveUser,
  receiveBlogs,
  receiveAccount,
	receivePosts,
	receivePostsFailed,
	selectPost,
	disconnectAuth,
	receivePreferences, receivePostContent
} from './index'

export const registIpcEvent = (store) => {
	ipcRenderer.send('fetch-initial-data')
  ipcRenderer.send("fetch-preferences")

	ipcRenderer.on('initialized', (e, accounts) => {
		store.dispatch(initialized(accounts))
	})

	ipcRenderer.on("start-fetch-user", (e, user) => {
  	store.dispatch(startFetchUser(user))
	})

	ipcRenderer.on("end-fetch-user", (e, user) => {
  	store.dispatch(endFetchUser(user))
  })

  ipcRenderer.on("receive-user", (e, user) => {
  	store.dispatch(receiveUser(user))
  })

  ipcRenderer.on("receive-blogs", (e, blogs) => {
  	store.dispatch(receiveBlogs(blogs))
  })

  ipcRenderer.on("receive-account", (e, account) => {
    store.dispatch(receiveAccount(account))
  })

  ipcRenderer.on("receive-posts-failed", (e, res) => {
    store.dispatch(receivePostsFailed())
  })
  ipcRenderer.on("receive-posts", (e, res) => {
  	store.dispatch(receivePosts(res.page, res.posts, res.hasNext))
  })

  ipcRenderer.on("receive-content", (e, post) => {
  	store.dispatch(receivePostContent(post))
  })

  ipcRenderer.on("complete-disconnect-auth", (e) => {
  	store.dispatch(disconnectAuth())
  })

  ipcRenderer.on("receive-preferences", (e, preferences) => {
    store.dispatch(receivePreferences(preferences))
  })
}
