import * as types from '../constants/ActionTypes'
import { ipcRenderer } from 'electron'

export const initialized = () => ({
	 type: types.INITIALIZED
})

export const startFetchUser = () => ({
	type: types.START_FETCH_USER
})

export const endFetchUser = () => ({
	type: types.END_FETCH_USER
})

export const receiveUser = (user) => ({
	 type: types.RECEIVE_USER, user
})

export const receiveBlogs = (blogs) => ({
	 type: types.RECEIVE_BLOGS, blogs
})

export const receivePostsFailed = () => ({
	 type: types.RECEIVE_POSTS_FAILED
})

export const receivePosts = (page, posts, hasNext) => ({
	 type: types.RECEIVE_POSTS, page, posts, hasNext
})

export const receiveCategories = (categories) => ({
	 type: types.RECEIVE_CATEGORIES, categories
})

export const disconnectAuth = () => ({
	 type: types.DISCONNECT_AUTH
})

export const selectBlog = (blog) => ({
	 type: types.SELECT_BLOG, blog
})

export const goIndex = () => ({
	 type: types.GO_INDEX
})

export const lockPostsLoad = () => ({
	 type: types.LOCK_POSTS_LOAD
})

export const selectPost = (post) => ({
	 type: types.SELECT_POST, post
})

export const receivePostContent = (post) => ({
	 type: types.RECEIVE_POST_CONTENT, post
})

export const updatePost = (post) => ({
	 type: types.UPDATE_POST, post
})

export const addPost = (post) => ({
	 type: types.ADD_POST, post
})

export const receivePreferences = (preferences) => ({
	 type: types.RECEIVE_PREFERENCES, preferences
})
