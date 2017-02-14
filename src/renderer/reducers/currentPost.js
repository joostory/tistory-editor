import * as types from '../constants/ActionTypes'
import { combineReducers } from 'redux'

const initialState = null

export default (state = initialState, action) => {
	switch (action.type) {
		case types.DISCONNECT_AUTH:
		case types.GO_INDEX:
			return initialState
		case types.SELECT_POST:
			return action.post
		default:
			return state
	}
}
