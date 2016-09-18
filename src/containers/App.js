import React, { Component, PropTypes } from 'react'
import classnames from 'classnames'
import { connect } from 'react-redux'

import { receiveLocalPost, removeLocalPost, updateLocalPost } from '../actions'

import Sidebar from '../components/Sidebar'
import Editor from '../components/Editor'

class App extends Component {
	constructor(props, context) {
		super(props, context)
		this.state = {
			currentPost: props.posts.length > 0? props.posts[0]:{}
		}
	}

	handleSelect(id) {
		const { dispatch, posts } = this.props
		let filterdPosts = posts.filter((item, index) => item.id == id)
		if (filterdPosts.length > 0) {
			this.setState({
				currentPost:filterdPosts[0]
			})
		}
	}

	handleAdd(post) {
		const { dispatch } = this.props
		dispatch(receiveLocalPost(post))
	}

	handleRemove(id) {
		const { dispatch } = this.props
		dispatch(removeLocalPost(id))
	}

	handleUpdate(post) {
		const { dispatch } = this.props
		dispatch(updateLocalPost(post))
	}

	render() {
		const { posts } = this.props
		const { currentPost } = this.state

		return(
			<div>
				<Sidebar posts={posts}
					onSelect={this.handleSelect.bind(this)}
					onAdd={this.handleAdd.bind(this)}
					onRemove={this.handleRemove.bind(this)} />
				<Editor post={currentPost} onSave={this.handleUpdate.bind(this)} />
			</div>
		)
	}
}

App.propTypes = {
	posts: PropTypes.array.isRequired
}

function mapStateToProps(state) {
  return {
		posts: state.posts
  }
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch: dispatch
  }
}

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(App)
