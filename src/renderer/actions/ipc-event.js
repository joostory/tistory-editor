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
    console.log('Renderer.receive: initialized', accounts)
		store.dispatch(initialized(accounts))
	})

  ipcRenderer.on("receive-account", (e, account) => {
    console.log('Renderer.receive: receive-account', account)
    store.dispatch(receiveAccount(account))
  })

  ipcRenderer.on("receive-categories", (e, categories) => {
    console.log('Renderer.receive: receive-categories', categories)
    store.dispatch(receiveCategories(categories))
  })

  ipcRenderer.on("receive-posts-failed", (e, res) => {
    console.log('Renderer.receive: receive-posts-failed')
    store.dispatch(receivePostsFailed())
  })
  ipcRenderer.on("receive-posts", (e, res) => {
    console.log('Renderer.receive: receive-posts', res)
  	store.dispatch(receivePosts(res.page, res.posts, res.hasNext))
  })

  ipcRenderer.on("receive-content", (e, post) => {
    console.log('Renderer.receive: receive-content', post)
  	store.dispatch(receivePostContent(post))
  })

  ipcRenderer.on("complete-disconnect-auth", (e, uuid) => {
    console.log('Renderer.receive: complete-disconnect-auth', uuid)
  	store.dispatch(disconnectAuth(uuid))
  })

  ipcRenderer.on("receive-preferences", (e, preferences) => {
    console.log('Renderer.receive: receive-preferences', preferences)
    store.dispatch(receivePreferences(preferences))
  })
}
