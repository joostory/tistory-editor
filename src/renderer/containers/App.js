import React, { Component, PropTypes } from 'react'
import classnames from 'classnames'
import { connect } from 'react-redux'

import { receiveLocalPost, removeLocalPost, updateLocalPost } from '../actions'

import Sidebar from '../components/Sidebar'
import Editor from '../components/Editor'
import Ready from '../components/Ready'
import Index from '../components/Index'
import Blog from '../components/Blog'

import '../../css/editor.css'

class App extends Component {

	render() {
		const { user, currentBlog } = this.props

		if (user && currentBlog) {
			return <Blog />

		} else if (user) {
			return <Index />

		} else {
			return <Ready />
		}
	}
}

App.propTypes = {
	user: PropTypes.object,
	blogs: PropTypes.array,
	currentBlog: PropTypes.object
}

const mapStateToProps = (state) => {
  return {
		user: state.user,
		blogs: state.blogs,
		currentBlog: state.currentBlog
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
