import React, { Component } from 'react'
import { connect } from 'react-redux'

import Loading from '../components/Loading'
import Ready from '../components/Ready'
import Index from '../components/index/Index'
import Blog from '../components/blog/Blog'

function Main(props) {
	const { status, user, currentBlog } = props

	if (!status.initialized) {
		return <Loading />
	}

	if (user && currentBlog) {
		return <Blog />

	} else if (user) {
		return <Index />

	} else {
		return <Ready />
	}
}

export default connect(state => ({
	status: state.status,
	user: state.user,
	blogs: state.blogs,
	currentBlog: state.currentBlog
}), dispatch => ({}))(Main);