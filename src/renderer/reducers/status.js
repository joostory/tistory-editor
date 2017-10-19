import * as types from '../constants/ActionTypes'
import update from 'immutability-helper'

const initialState = {
	initialized: false,
	fetchUser: false
}

export default (state = initialState, action) => {
	switch (action.type) {
		case types.INITIALIZED:
			return update(state, {
				initialized: {
					$set: true
				}
			})
		case types.START_FETCH_USER:
			return update(state, {
				fetchUser: {
					$set: true
				}
			})
		case types.END_FETCH_USER:
		case types.RECEIVE_USER:
			return update(state, {
				fetchUser: {
					$set: false
				}
			})
		default:
			return state
	}
}
