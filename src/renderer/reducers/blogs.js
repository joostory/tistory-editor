import * as types from '../constants/ActionTypes'
import { combineReducers } from 'redux'

const initialState = []

export default (state = initialState, action) => {
	switch (action.type) {
		case types.DISCONNECT_AUTH:
			return initialState
		case types.RECEIVE_BLOGS:
			return action.blogs
		default:
			return state
	}
}
