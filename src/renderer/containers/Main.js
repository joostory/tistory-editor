import React, { Component } from 'react'
import { useSelector } from 'react-redux'

import Loading from '../components/Loading'
import Ready from '../components/Ready'
import Index from '../components/index/Index'
import Blog from '../components/blog/Blog'

export default function Main() {
	const status = useSelector(state => state.status)
	const user = useSelector(state => state.user)
	const currentBlog = useSelector(state => state.currentBlog)


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
