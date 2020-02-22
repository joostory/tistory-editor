import { ipcRenderer } from 'electron'
import {
	initialized,
  receiveAccount,
  receiveCategories,
	receivePosts,
	receivePostsFailed,
	disconnectAuth,
  receivePreferences,
  receivePostContent
} from './index'

export const registIpcEvent = (store) => {
	ipcRenderer.send('fetch-initial-data')
  ipcRenderer.send("fetch-preferences")

	ipcRenderer.on('initialized', (e, accounts) => {
		store.dispatch(initialized(accounts))
	})

  ipcRenderer.on("receive-account", (e, account) => {
    store.dispatch(receiveAccount(account))
  })

  ipcRenderer.on("receive-categories", (e, categories) => {
    store.dispatch(receiveCategories(categories))
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

  ipcRenderer.on("complete-disconnect-auth", (e, uuid) => {
  	store.dispatch(disconnectAuth(uuid))
  })

  ipcRenderer.on("receive-preferences", (e, preferences) => {
    store.dispatch(receivePreferences(preferences))
  })
}
