import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { ipcRenderer } from 'electron'

import { selectBlog } from '../../actions'
import IndexProfile from './IndexProfile'
import BlogList from './BlogList'

import { pageview } from '../../modules/AnalyticsHelper'

export default function Index() {

	const user = useSelector(state => state.user)
	const blogs = useSelector(state => state.blogs)
	const dispatch = useDispatch()

	function handleSelectBlog(blog) {
		ipcRenderer.send("fetch-categories", blog.name)
		dispatch(selectBlog(blog))
	}

	useEffect(() => {
		pageview('/index', 'Index')
	}, [])

	return (
		<div className="container">
			<IndexProfile user={user} />
			<BlogList blogs={blogs} onSelect={handleSelectBlog} />
		</div>
	)
}
