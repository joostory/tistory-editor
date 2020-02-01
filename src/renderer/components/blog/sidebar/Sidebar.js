import React from 'react'
import Header from './Header'
import PostList from './PostList'


export default function Sidebar() {
	return (
		<div className="sidebar">
			<Header />
			<PostList />
		</div>
	)
}
