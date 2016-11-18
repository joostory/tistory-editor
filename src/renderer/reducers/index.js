import * as types from '../constants/ActionTypes'
import { combineReducers } from 'redux'
import info from './info'
import fetchlock from './fetchlock'

export default combineReducers({
	info,
	fetchlock
})
