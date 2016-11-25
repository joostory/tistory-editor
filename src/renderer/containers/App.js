import React, { Component, PropTypes } from 'react'
import classnames from 'classnames'
import { connect } from 'react-redux'

import { receiveLocalPost, removeLocalPost, updateLocalPost, requestAuth } from '../actions'

import Sidebar from '../components/Sidebar'
import Editor from '../components/Editor'
import Ready from '../components/Ready'
import Index from '../components/Index'
import Blog from '../components/Blog'

class App extends Component {
	constructor(props, context) {
		super(props, context)
		this.state = {
			currentBlog: null
		}
	}

	handleSelectBlog(blog) {
		console.log("App.selectBlog", blog)
		this.setState({
			currentBlog: blog
		})
	}

	render() {
		const { user, blogs } = this.props
		const { currentBlog } = this.state

		console.log("App.render", user, blogs, currentBlog)

		if (user && user.name && currentBlog) {
			return <Blog user={user} currentBlog={currentBlog} onSelect={this.handleSelectBlog.bind(this)} />

		} else if (user && user.name) {
			return <Index user={user} blogs={blogs} onSelect={this.handleSelectBlog.bind(this)} />

		} else {
			return <Ready />
		}
	}
}

App.propTypes = {
	user: PropTypes.object.isRequired,
	blogs: PropTypes.array.isRequired
}

const mapStateToProps = (state) => {
  return {
		user: state.user,
		blogs: state.blogs,
		fetchlock: state.fetchlock
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch: dispatch
  }
}

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(App)
