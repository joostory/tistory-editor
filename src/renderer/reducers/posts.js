import * as types from '../constants/ActionTypes'
import { combineReducers } from 'redux'

const initialState = {
	page: 0,
	list: [],
	lock: false
}

export default (state = initialState, action) => {
	switch (action.type) {
		case types.DISCONNECT_AUTH:
		case types.GO_INDEX:
			return initialState
		case types.LOCK_POSTS_LOAD:
			return {
				page: state.page,
				list: state.list,
				lock: true
			}
		case types.RECEIVE_POSTS:
			return {
				page: action.page,
				list: [...state.list, ...action.posts],
				lock: false
			}
		default:
			return state
	}
}
