import React, { Component, PropTypes } from 'react'

import Header from './Header'
import PostList from './PostList'

class Sidebar extends Component {

	constructor(props, context) {
		super(props, context)
	}

	render() {
		const { user, currentBlog, posts, categories, currentPost, onRequestAddPost, onRequestNextPage, onSelectBlog, onSelectPost } = this.props

		return (
			<div className="sidebar">
				<Header user={user} currentBlog={currentBlog}
					onRequestAddPost={onRequestAddPost}
					onSelect={onSelectBlog} />

				<PostList categories={categories} posts={posts} currentPost={currentPost}
					onRequestNextPage={onRequestNextPage}
					onSelect={onSelectPost} />
			</div>
		)
	}
}

Sidebar.PropTypes = {
	user: PropTypes.object.isRequired,
	posts: PropTypes.array.isRequired,
	categories: PropTypes.array.isRequired,
	currentBlog: PropTypes.object.isRequired,
	currentPost: PropTypes.object.isRequired,
	onRequestAddPost: PropTypes.func.isRequired,
	onRequestNextPage: PropTypes.func.isRequired,
	onSelectBlog: PropTypes.func.isRequired,
	onSelectPost: PropTypes.func.isRequired
}

export default Sidebar
