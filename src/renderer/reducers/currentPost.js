import * as types from '../constants/ActionTypes'
import update from 'immutability-helper'

const initialState = null

export default (state = initialState, action) => {
	switch (action.type) {
		case types.DISCONNECT_AUTH:
		case types.GO_INDEX:
			return initialState
		case types.SELECT_POST:
			return action.post
		case types.ADD_POST:
		case types.UPDATE_POST:
		case types.RECEIVE_POST_CONTENT:
			return update(action.post, {
				fetched: {
					$set: true
				}
			})
		default:
			return state
	}
}
