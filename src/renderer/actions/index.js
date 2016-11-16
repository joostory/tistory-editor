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

function receiveInfo(info) {
	return { type: types.RECEIVE_INFO, info }
}

export function fetchInfo() {
	return dispatch => {
		ipcRenderer.on("receive-info", (e, info) => {
			dispatch(receiveInfo(info))
		})
		ipcRenderer.send("fetch-info")
	}
}

export function requestAuth() {
	return dispatch => {
		ipcRenderer.on("receive-info", (e, info) => {
			dispatch(receiveInfo(info))
		})
		ipcRenderer.send("request-auth")
	}
}
