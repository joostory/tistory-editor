import React, { Component } from 'react'
import PropTypes from 'prop-types'

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

Sidebar.propTypes = {
	onRequestAddPost: PropTypes.func.isRequired
}

export default Sidebar
