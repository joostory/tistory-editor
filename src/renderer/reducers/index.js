import * as types from '../constants/ActionTypes'
import { combineReducers } from 'redux'
import auth from './auth'

const initialState = {
	posts: []
}

function updateLocalPost(posts, targetPost) {
	let newPosts = posts.concat()
	let index = newPosts.findIndex(post => post.id == targetPost.id)
	if (index >= 0) {
		newPosts[index] = targetPost
	}
	return newPosts
}

function posts(state = initialState.posts, action) {
	switch (action.type) {
		case types.RECEIVE_LOCAL_POSTS:
			return action.posts
		case types.RECEIVE_LOCAL_POST:
			return state.concat([ action.post ])
		case types.UPDATE_LOCAL_POST:
			return updateLocalPost(state, action.post)
		case types.REMOVE_LOCAL_POST:
			return state.filter(post => post.id != action.id)
		default:
			return state
	}
}


export default combineReducers({
	posts,
	auth
})
