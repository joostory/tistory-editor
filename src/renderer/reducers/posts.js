import * as types from '../constants/ActionTypes'
import { combineReducers } from 'redux'
import update from 'immutability-helper'

const initialState = {
	page: 0,
	list: [],
	hasNext: true,
	lock: false
}

export default (state = initialState, action) => {
	switch (action.type) {
		case types.DISCONNECT_AUTH:
		case types.GO_INDEX:
			return initialState
		case types.LOCK_POSTS_LOAD:
			return update(state, {
				lock: {
					$set: true
				}
			})
		case types.RECEIVE_POSTS_FAILED:
			return update(state, {
				hasNext: {
					$set: false
				},
				lock: {
					$set: false
				}
			})
		case types.RECEIVE_POSTS:
			return {
				page: action.page,
				list: [...state.list, ...action.posts],
				hasNext: action.hasNext,
				lock: false
			}
		case types.UPDATE_POST:
			let index = state.list.findIndex((item) => {
				return item.id == action.post.id
			})
			return update(state, {
				list: {
					[index]: {
						$set: action.post
					}
				}
			})
		case types.ADD_POST:
			return update(state, {
				list: {
					$unshift: [action.post]
				}
			})
		default:
			return state
	}
}
