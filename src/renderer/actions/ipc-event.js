import { ipcRenderer } from 'electron'
import {
  receiveUser,
  receiveBlogs,
  receivePosts,
  receivePostsFailed,
  receiveCategories,
  selectPost,
  disconnectAuth,
  receivePreferences
} from './index'

export const registIpcEvent = (store) => {
  ipcRenderer.send("fetch-user")
  ipcRenderer.send("fetch-blogs")
  ipcRenderer.send("fetch-preferences")

  ipcRenderer.on("receive-user", (e, user) => {
  	store.dispatch(receiveUser(user))
  })

  ipcRenderer.on("receive-blogs", (e, user) => {
  	store.dispatch(receiveBlogs(user))
  })

  ipcRenderer.on("receive-posts-failed", (e, res) => {
    store.dispatch(receivePostsFailed())
  })
  ipcRenderer.on("receive-posts", (e, res) => {
  	store.dispatch(receivePosts(res.page, res.posts, res.hasNext))
  })

  ipcRenderer.on("receive-categories", (e, categories) => {
  	store.dispatch(receiveCategories(categories))
  })

  ipcRenderer.on("receive-content", (e, post) => {
  	store.dispatch(selectPost(post))
  })

  ipcRenderer.on("complete-disconnect-auth", (e) => {
  	store.dispatch(disconnectAuth())
  })

  ipcRenderer.on("receive-preferences", (e, preferences) => {
    store.dispatch(receivePreferences(preferences))
  })
}
