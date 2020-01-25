import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { ipcRenderer } from 'electron'

import { CircularProgress, List } from '@material-ui/core'

import PostListItem from './PostListItem'
import { selectPost, lockPostsLoad } from '../../../actions'

export default function PostList() {

	const posts = useSelector(state => state.posts)
	const currentPost = useSelector(state => state.currentPost)
	const currentBlog = useSelector(state => state.currentBlog)
	const dispatch = useDispatch()

	function requestNextPage() {
		if (!posts.lock && posts.hasNext) {
			dispatch(lockPostsLoad())
			ipcRenderer.send('fetch-posts', currentBlog.name, posts.list.length)
		}
	}

	function handleScroll(e) {
		const { clientHeight, scrollHeight, scrollTop } = e.target

		if (clientHeight + scrollTop + 200 > scrollHeight) {
			requestNextPage()
		}
	}

	function handleSelectPost(item) {
		if (currentPost && currentPost.id == item.id) {
			return
		}

		dispatch(selectPost(item))
	}

	useEffect(() => {
		requestNextPage()
	}, [])

	return (
		<List className="list" style={{padding:0}} onScroll={handleScroll}>
			{posts.list.map((item, i) =>
				<PostListItem key={i}
					post={item}
					selected={!!currentPost && item.id == currentPost.id}
					onSelect={handleSelectPost} />
			)}

			{!posts.hasNext && posts.list.length === 0 &&
				<div style={{textAlign:'center', padding:'10px', color:'#aaa'}}>
					No contents
				</div>
			}

			{posts.hasNext &&
				<div style={{textAlign:'center', padding:'10px'}}>
					<CircularProgress size={30} thickness={3} />
				</div>
			}
		</List>
	)
}

