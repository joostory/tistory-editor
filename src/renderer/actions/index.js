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

export const receiveInfo = (info) => {
	return { type: types.RECEIVE_INFO, info }
}

export const fetchInfo = () => {
	ipcRenderer.send("fetch-info")
}

export const requestAuth = () => {
	ipcRenderer.send("request-auth")
}

export const disconnectAuth = () => {
	ipcRenderer.send("disconnect-auth")
}
