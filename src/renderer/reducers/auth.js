import * as types from '../constants/ActionTypes'
import { combineReducers } from 'redux'

const initialState = {}

export default function auth(state = initialState, action) {
	switch (action.type) {
		case types.RECEIVE_AUTH:
			return action.auth
		default:
			return state
	}
}
