import * as types from '../constants/ActionTypes'
import Database from '../database'
import {ipcRenderer} from 'electron'

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

export const fetchUser = () => {
	ipcRenderer.send("fetch-user")
}

export const fetchBlogs = () => {
	ipcRenderer.send("fetch-blogs")
}

export const requestAuth = () => {
	ipcRenderer.send("request-auth")
}

export const disconnectAuth = () => {
	ipcRenderer.send("disconnect-auth")
}
