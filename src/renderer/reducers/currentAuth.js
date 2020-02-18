import * as types from '../constants/ActionTypes'

const initialState = null

export default (state = initialState, action) => {
	switch (action.type) {
		case types.DISCONNECT_AUTH:
			return initialState
		case types.SELECT_BLOG:
			return action.auth
		default:
			return state
	}
}
