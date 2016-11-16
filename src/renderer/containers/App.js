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

	render() {
		const { info } = this.props
		const { currentBlog } = this.state

		if (currentBlog) {
			return <Blog info={info} current={currentBlog} />

		} else if (info && info.id) {
			return <Index info={info} />

		} else {
			return <Ready />
		}
	}
}

App.propTypes = {
	info: PropTypes.object.isRequired
}

function mapStateToProps(state) {
  return {
		info: state.info
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
