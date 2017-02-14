import * as types from '../constants/ActionTypes'
import { combineReducers } from 'redux'
import user from './user'
import blogs from './blogs'
import posts from './posts'
import categories from './categories'
import currentBlog from './currentBlog'
import currentPost from './currentPost'
import fetchlock from './fetchlock'

export default combineReducers({
	user,
	blogs,
	currentBlog,
	categories,
	posts,
	currentPost,
	fetchlock
})
