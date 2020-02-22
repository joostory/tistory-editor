import * as types from '../constants/ActionTypes'
import update from 'immutability-helper'

const initialState = []

export default (state = initialState, action) => {
	switch (action.type) {
		case types.INITIALIZED:
      return action.accounts
    case types.DISCONNECT_AUTH:
      let index = state.findIndex(a => a.auth.uuid == action.uuid)
      if (index < 0) {
        return state
      }
      return update(state, {
        $splice: [[index, 1]]
      })
      
    case types.RECEIVE_ACCOUNT:
      return update(state, {
        $push: [action.account]
      })
		default:
			return state
	}
}
