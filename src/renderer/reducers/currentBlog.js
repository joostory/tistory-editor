import * as types from '../constants/ActionTypes'
import { combineReducers } from 'redux'

const initialState = null

export default (state = initialState, action) => {
	switch (action.type) {
		case types.DISCONNECT_AUTH:
		case types.GO_INDEX:
			return initialState
		case types.SELECT_BLOG:
			return action.blog
		default:
			return state
	}
}
