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
		const { onSelect, onAdd, onRemove } = this.props
		const { posts } = this.state

		return (
			<div className="sidebar">
				<Header />
				<PostList posts={posts}
				 	onSelect={onSelect}
					onAdd={onAdd}
					onRemove={onRemove} />
			</div>
		)
	}
}

Sidebar.PropTypes = {
	onSelect: PropTypes.func,
	onAdd: PropTypes.func,
	onRemove: PropTypes.func
}

export default Sidebar
