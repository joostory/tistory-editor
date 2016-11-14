import React, { Component, PropTypes } from 'react'

import Header from '../components/Header'
import LocalPostList from './LocalPostList'

class Sidebar extends Component {
	render() {
		const { posts, onSelect, onAdd, onRemove } = this.props;

		return (
			<div className="sidebar">
				<Header />
				<LocalPostList posts={posts}
				 	onSelect={onSelect}
					onAdd={onAdd}
					onRemove={onRemove} />
			</div>
		)
	}
}

Sidebar.PropTypes = {
	posts: PropTypes.array.isRequired,
	onSelect: PropTypes.func,
	onAdd: PropTypes.func,
	onRemove: PropTypes.func
}

export default Sidebar
