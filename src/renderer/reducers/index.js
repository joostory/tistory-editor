import { combineReducers } from 'redux'
import status from './status'
import user from './user'
import blogs from './blogs'
import posts from './posts'
import currentBlog from './currentBlog'
import currentPost from './currentPost'
import preferences from './preferences'

export default combineReducers({
	status,
	user,
	blogs,
	currentBlog,
	posts,
	currentPost,
	preferences
})
