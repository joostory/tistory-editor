import React from 'react'
import Header from './Header'
import PostList from './PostList'


export default function Sidebar({onRequestAddPost}) {
	return (
		<div className="sidebar">
			<Header onRequestAddPost={onRequestAddPost} />
			<PostList />
		</div>
	)
}
