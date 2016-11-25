import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

import Sidebar from './Sidebar'
import Content from './Content'

class Blog extends Component {

	constructor(props, context) {
		super(props, context)
		this.state = {
			currentPost: {}
		}
	}

	handleSelectBlog(blog) {
		this.props.onSelect(blog)
	}

	handleSelectPost(post) {
		this.setState({
			currentPost: post
		})
	}

	render() {
		const { user, currentBlog } = this.props
		const { currentPost } = this.state

		return (
			<div className="container">
				<Sidebar user={user} currentBlog={currentBlog}
					onSelectBlog={this.handleSelectBlog.bind(this)}
					onSelectPost={this.handleSelectPost.bind(this)} />
				<Content post={{}} onSave={() => {}} />
			</div>
		)
	}
}

Blog.propTypes = {
	user: PropTypes.object.isRequired,
	currentBlog: PropTypes.object.isRequired,
	onSelect: PropTypes.func.isRequired
}

export default Blog
