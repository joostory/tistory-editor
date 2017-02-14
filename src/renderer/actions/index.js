import * as types from '../constants/ActionTypes'
import { ipcRenderer } from 'electron'

export function updateLocalPost(post) {
	return { type: types.UPDATE_LOCAL_POST, post }
}

export function receiveLocalPost(post) {
	return { type: types.RECEIVE_LOCAL_POST, post }
}

export function receiveLocalPosts(posts) {
	return { type: types.RECEIVE_LOCAL_POSTS, posts }
}

export function removeLocalPost(id) {
	return { type: types.REMOVE_LOCAL_POST, id }
}

const receiveFetchlock = (fetchlock) => {
	return { type: types.RECEIVE_FETCH_LOCK, fetchlock: fetchlock }
}

const lockFetch = () => {
	return receiveFetchlock(true)
}

const unlockFetch = () => {
	return receiveFetchlock(false)
}

export const receiveUser = (user) => {
	return { type: types.RECEIVE_USER, user }
}

export const receiveBlogs = (blogs) => {
	return { type: types.RECEIVE_BLOGS, blogs }
}

export const receivePosts = (page, posts) => {
	return { type: types.RECEIVE_POSTS, page, posts }
}

export const requestAuth = () => {
	ipcRenderer.send("request-auth")
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
