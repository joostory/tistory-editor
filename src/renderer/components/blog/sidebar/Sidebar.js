import React from 'react'
import Header from './Header'
import PostList from './PostList'


export default function Sidebar({onSelectBlog}) {
	return (
		<div className="sidebar">
			<Header onSelectBlog={onSelectBlog} />
			<PostList />
		</div>
	)
}
