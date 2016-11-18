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
		this.setState({
			currentBlog: blog
		})
	}

	render() {
		const { info } = this.props
		const { currentBlog } = this.state

		if (info && info.id && currentBlog) {
			return <Blog info={info} current={currentBlog} />

		} else if (info && info.id) {
			return <Index info={info} onSelect={this.handleSelectBlog.bind(this)} />

		} else {
			return <Ready />
		}
	}
}

App.propTypes = {
	info: PropTypes.object.isRequired
}

const mapStateToProps = (state) => {
  return {
		info: state.info,
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
