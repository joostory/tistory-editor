import React, { Component, PropTypes } from 'react'

import Header from './Header'
import PostList from './PostList'

class Sidebar extends Component {

	constructor(props, context) {
		super(props, context)
	}

	render() {
		const { onRequestAddPost } = this.props

		return (
			<div className="sidebar">
				<Header onRequestAddPost={onRequestAddPost} />
				<PostList />
			</div>
		)
	}
}

Sidebar.PropTypes = {
	onRequestAddPost: PropTypes.func.isRequired
}

export default Sidebar
