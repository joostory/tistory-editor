import React, { Component, PropTypes } from 'react'

import Header from './Header'
import PostList from './PostList'

class Sidebar extends Component {

	constructor(props, context) {
		super(props, context)
	}

	render() {
		const { user, currentBlog, posts, categories, currentPost, onSelectBlog, onSelectPost } = this.props

		return (
			<div className="sidebar">
				<Header user={user} currentBlog={currentBlog}
					onSelect={onSelectBlog} />

				<PostList categories={categories} posts={posts} currentPost={currentPost}
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
	onSelectBlog: PropTypes.func.isRequired,
	onSelectPost: PropTypes.func.isRequired
}

export default Sidebar
