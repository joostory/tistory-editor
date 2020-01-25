import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'

import Sidebar from './sidebar/Sidebar'
import Content from './content/Content'
import Editor from '../editor/Editor'
import * as ContentMode from '../../constants/ContentMode'

import { pageview } from '../../modules/AnalyticsHelper'

export default function Blog() {
	const currentBlog = useSelector(state => state.currentBlog)
	const [mode, setMode] = useState(ContentMode.VIEW)


	useEffect(() => {
		pageview(`/blog/${currentBlog.blogId}`, `${currentBlog.name}`)
	}, [])

	return (
		<div className="container">
			<Sidebar onRequestAddPost={() => setMode(ContentMode.ADD)} />

			<Content onRequestEditPost={() => setMode(ContentMode.EDIT)}/>

			{(mode === ContentMode.EDIT || mode === ContentMode.ADD) &&
				<Editor mode={mode} onFinish={() => setMode(ContentMode.VIEW)} />
			}
		</div>
	)
}
