import * as types from '../constants/ActionTypes'
import { combineReducers } from 'redux'

const initialState = {
	page: 0,
	list: [],
	hasNext: true,
	lock: false
}

export default (state = initialState, action) => {
	switch (action.type) {
		case types.DISCONNECT_AUTH:
		case types.GO_INDEX:
			return initialState
		case types.LOCK_POSTS_LOAD:
			return Object.assign({}, state, {
				lock: true
			})
		case types.RECEIVE_POSTS_FAILED:
			return Object.assign({}, state, {
				hasNext: false,
				lock: false
			})
		case types.RECEIVE_POSTS:
			return {
				page: action.page,
				list: [...state.list, ...action.posts],
				hasNext: action.hasNext,
				lock: false
			}
		case types.UPDATE_POST:
			let newList = [...state.list]
			let index = newList.findIndex((item) => {
				console.log("findIndex", item.id, action.post.id, item.id == action.post.id)
				return item.id == action.post.id
			})
			newList[index] = action.post
			return Object.assign({}, state, {
				list: newList
			})
		case types.ADD_POST:
			return Object.assign({}, state, {
				list: [action.post, ...state.list]
			})
		default:
			return state
	}
}
