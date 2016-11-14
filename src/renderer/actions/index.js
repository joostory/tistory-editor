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

function receiveAuth(auth) {
	return { type: types.RECEIVE_AUTH, auth }
}

export function fetchAuth() {
	return dispatch => {
		ipcRenderer.on("receive-auth", (e, auth) => {
			dispatch(receiveAuth(auth))
		})
		ipcRenderer.send("fetch-auth")
	}
}

export function requestAuth() {
	return dispatch => {
		ipcRenderer.on("receive-auth", (e, auth) => {
			dispatch(receiveAuth(auth))
		})
		ipcRenderer.send("request-auth")
	}
}
