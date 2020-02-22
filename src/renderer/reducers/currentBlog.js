import update from 'immutability-helper'
import * as types from '../constants/ActionTypes'

const initialState = null

export default (state = initialState, action) => {
	switch (action.type) {
		case types.DISCONNECT_AUTH:
			return initialState
		case types.SELECT_BLOG:
      return action.blog
    case types.RECEIVE_CATEGORIES:
      return update(state, {
        categories: {
          $set: action.categories
        }
      })
		default:
			return state
	}
}
