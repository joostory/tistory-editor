import React, { Component, PropTypes } from 'react'
import classnames from 'classnames'
import { connect } from 'react-redux'

import { receiveLocalPost, removeLocalPost, updateLocalPost, requestAuth } from '../actions'

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
			this.setCurrentPost(filterdPosts[0])
		}
	}

	handleAdd(post) {
		const { dispatch } = this.props
		dispatch(receiveLocalPost(post))
		this.setCurrentPost(post)
	}

	handleRemove(id) {
		const { dispatch } = this.props
		const { currentPost } = this.state
		dispatch(removeLocalPost(id))
		if (currentPost.id == id) {
			this.setCurrentPost({})
		}
	}

	setCurrentPost(post) {
		this.setState({
			currentPost: post
		})
	}

	handleUpdate(post) {
		const { dispatch } = this.props
		dispatch(updateLocalPost(post))
	}

	handleAuth() {
		const { dispatch } = this.props
		dispatch(requestAuth())
	}

	render() {
		const { auth, posts } = this.props
		const { currentPost } = this.state

		if (auth.access_token) {
			return(
				<div>
					<Sidebar posts={posts}
						onSelect={this.handleSelect.bind(this)}
						onAdd={this.handleAdd.bind(this)}
						onRemove={this.handleRemove.bind(this)} />
					<Editor post={currentPost} onSave={this.handleUpdate.bind(this)} />
				</div>
			)
		} else {
			return(
				<div>
					<button className="btn_auth" onClick={this.handleAuth.bind(this)}>티스토리 인증</button>
				</div>
			)
		}


	}
}

App.propTypes = {
	auth: PropTypes.object.isRequired,
	posts: PropTypes.array.isRequired
}

function mapStateToProps(state) {
  return {
		auth: state.auth,
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
