import * as types from '../constants/ActionTypes'
import { combineReducers } from 'redux'

const initialState = false

export default (state = initialState, action) => {
	switch (action.type) {
		case types.RECEIVE_FETCH_LOCK:
			return action.fetchlock
		default:
			return state
	}
}
