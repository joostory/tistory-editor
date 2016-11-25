import * as types from '../constants/ActionTypes'
import { combineReducers } from 'redux'

const initialState = {}

export default (state = initialState, action) => {
	switch (action.type) {
		case types.RECEIVE_USER:
			return action.user
		default:
			return state
	}
}
