import * as types from '../constants/ActionTypes'
import { ipcRenderer } from 'electron'

export const receiveUser = (user) => {
	return { type: types.RECEIVE_USER, user }
}

export const receiveBlogs = (blogs) => {
	return { type: types.RECEIVE_BLOGS, blogs }
}

export const receivePosts = (page, posts, hasNext) => {
	return { type: types.RECEIVE_POSTS, page, posts, hasNext }
}

export const receiveCategories = (categories) => {
	return { type: types.RECEIVE_CATEGORIES, categories }
}

export const disconnectAuth = () => {
	return { type: types.DISCONNECT_AUTH }
}

export const selectBlog = (blog) => {
	return { type: types.SELECT_BLOG, blog }
}

export const goIndex = () => {
	return { type: types.GO_INDEX }
}

export const lockPostsLoad = () => {
	return { type: types.LOCK_POSTS_LOAD }
}

export const selectPost = (post) => {
	return { type: types.SELECT_POST, post }
}

export const updatePost = (post) => {
	return { type: types.UPDATE_POST, post }
}

export const addPost = (post) => {
	return { type: types.ADD_POST, post }
}

export const openMessage = (message) => {
	return { type: types.RECEIVE_MESSAGE, message }
}
