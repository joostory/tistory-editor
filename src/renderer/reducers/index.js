import { combineReducers } from 'redux'
import status from './status'
import accounts from './accounts'
import posts from './posts'
import currentAuth from './currentAuth'
import currentBlog from './currentBlog'
import currentPost from './currentPost'

export default combineReducers({
	status,
  accounts,
  currentAuth,
	currentBlog,
	posts,
	currentPost,
})
