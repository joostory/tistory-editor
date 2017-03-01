import { ipcRenderer } from 'electron'
import {
  receiveUser,
  receiveBlogs,
  receivePosts,
  receiveCategories,
  selectPost,
  disconnectAuth
} from './index'

export const registIpcEvent = (store) => {
  ipcRenderer.send("fetch-user")
  ipcRenderer.send("fetch-blogs")

  ipcRenderer.on("receive-user", (e, user) => {
  	store.dispatch(receiveUser(user))
  })

  ipcRenderer.on("receive-blogs", (e, user) => {
  	store.dispatch(receiveBlogs(user))
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
}
