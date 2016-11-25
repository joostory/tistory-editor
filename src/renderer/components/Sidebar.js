import React, { Component, PropTypes } from 'react'

import Header from '../components/Header'
import PostList from './PostList'

class Sidebar extends Component {

	constructor(props, context) {
		super(props, context)
		this.state = {
			posts: []
		}
	}

	render() {
		const { user, currentBlog, onSelectBlog, onSelectPost } = this.props
		const { posts } = this.state

		return (
			<div className="sidebar">
				<Header user={user} currentBlog={currentBlog}
					onSelect={onSelectBlog} />

				<PostList posts={posts}
					onSelect={onSelectPost} />
			</div>
		)
	}
}

Sidebar.PropTypes = {
	user: PropTypes.object.isRequired,
	currentBlog: PropTypes.object.isRequired,
	onSelectBlog: PropTypes.func.isRequired,
	onSelectPost: PropTypes.func.isRequired
}

export default Sidebar
