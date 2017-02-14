import * as types from '../constants/ActionTypes'
import { combineReducers } from 'redux'

const initialState = []

export default (state = initialState, action) => {
	switch (action.type) {
		case types.DISCONNECT_AUTH:
			return initialState
		case types.RECEIVE_CATEGORIES:
			return action.categories
		default:
			return state
	}
}
