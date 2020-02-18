import * as types from '../constants/ActionTypes'
import update from 'immutability-helper'

const initialState = {
	page: 0,
	list: [],
	hasNext: true,
  lock: false,
  initialized: false
}

export default (state = initialState, action) => {
	switch (action.type) {
		case types.DISCONNECT_AUTH:
		case types.SELECT_BLOG:
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
        },
        initialized: {
          $set: true
        }
			})
		case types.RECEIVE_POSTS:
			return {
				page: action.page,
				list: [...state.list, ...action.posts],
				hasNext: action.hasNext,
        lock: false,
        initialized: true
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
