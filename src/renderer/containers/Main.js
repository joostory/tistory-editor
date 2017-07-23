import React, { Component } from 'react'
import { connect } from 'react-redux'

import Ready from '../components/Ready'
import Index from '../components/index/Index'
import Blog from '../components/blog/Blog'

@connect(state => ({
	user: state.user,
	blogs: state.blogs,
	currentBlog: state.currentBlog
}), dispatch => ({}))
class Main extends Component {
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

export default Main
