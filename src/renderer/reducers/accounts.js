import * as types from '../constants/ActionTypes'
import update from 'immutability-helper'

const initialState = []

export default (state = initialState, action) => {
	switch (action.type) {
		case types.INITIALIZED:
      return action.accounts
    case types.RECEIVE_ACCOUNT:
      return update(state, {
        $push: [action.account]
      })
		default:
			return state
	}
}
