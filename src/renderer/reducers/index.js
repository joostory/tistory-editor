import * as types from '../constants/ActionTypes'
import { combineReducers } from 'redux'
import user from './user'
import blogs from './blogs'
import fetchlock from './fetchlock'

export default combineReducers({
	user,
	blogs,
	fetchlock
})
