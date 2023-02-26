import React, { useEffect } from 'react'
import { useRecoilState, useRecoilValue } from 'recoil'
import { ipcRenderer } from 'electron'

import { CircularProgress, List, Typography, Box } from '@mui/material'

import PostListItem from './PostListItem'
import { currentAuthState, currentBlogState } from '../../../state/currentBlog'
import { postsInitializedState, postsLockState, postsState } from '../../../state/posts'
import { currentPostState } from '../../../state/currentPost'


const styles = {
  root: {
    width: 300,
    overflow: 'auto'
  },
  message: {
    textAlign: 'center',
    padding:(theme) => theme.spacing(2),
    color: '#aaa'
  }
}

export default function PostList() {
  const posts = useRecoilValue(postsState)
  const [postsLock, setPostsLock] = useRecoilState(postsLockState)
  const postsInitialized = useRecoilValue(postsInitializedState)
  const [currentPost, setCurrentPost] = useRecoilState(currentPostState)
  const currentAuth = useRecoilValue(currentAuthState)
	const currentBlog = useRecoilValue(currentBlogState)

	function requestNextPage() {
		if (!postsLock && posts.hasNext) {
      setPostsLock(true)
      let options
      if (currentAuth.provider == 'tistory') {
        options = {
          page: Number(posts.page) + 1
        }
      } else if (currentAuth.provider == 'tumblr') {
        options = {
          offset: posts.list.length
        }
      }
      console.log("fetch-posts", currentAuth, currentBlog, options)
			ipcRenderer.send('fetch-posts', currentAuth.uuid, currentBlog.name, options)
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

    setCurrentPost(item)
	}

	useEffect(() => {
    if (!postsInitialized) {
      requestNextPage()
    }
  }, [posts])
  
	return (
		<List component='div' onScroll={handleScroll} disablePadding={true} sx={styles.root}>
			{posts.list.map((item, i) =>
				<PostListItem key={i}
					post={item}
					selected={!!currentPost && item.id == currentPost.id}
					onSelect={handleSelectPost} />
			)}

			{!posts.hasNext && posts.list.length === 0 &&
				<Typography sx={styles.message}>
					No contents
				</Typography>
			}

			{posts.hasNext &&
				<Box sx={styles.message}>
					<CircularProgress size={30} thickness={3} />
				</Box>
			}
		</List>
	)
}
