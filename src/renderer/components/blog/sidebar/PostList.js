import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { ipcRenderer } from 'electron'

import { CircularProgress, List, Typography, makeStyles, Box } from '@material-ui/core'

import PostListItem from './PostListItem'
import { selectPost, lockPostsLoad } from '../../../actions'


const useStyles = makeStyles(theme => ({
  root: {
    position: 'absolute',
    top: 64,
    bottom: 0,
    left: 0,
    right: 0,
    overflow: 'auto'
  },
  message: {
    textAlign: 'center',
    padding: theme.spacing(2),
    color: '#aaa'
  }
}))

export default function PostList() {

  const classes = useStyles()
  const posts = useSelector(state => state.posts)
  const currentPost = useSelector(state => state.currentPost)
  const currentAuth = useSelector(state => state.currentAuth)
	const currentBlog = useSelector(state => state.currentBlog)
	const dispatch = useDispatch()

	function requestNextPage() {
		if (!posts.lock && posts.hasNext) {
      dispatch(lockPostsLoad())
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

		dispatch(selectPost(item))
	}

	useEffect(() => {
    if (!posts.initialized) {
      requestNextPage()
    }
  }, [posts])
  
	return (
		<List component='div' onScroll={handleScroll} disablePadding={true} className={classes.root}>
			{posts.list.map((item, i) =>
				<PostListItem key={i}
					post={item}
					selected={!!currentPost && item.id == currentPost.id}
					onSelect={handleSelectPost} />
			)}

			{!posts.hasNext && posts.list.length === 0 &&
				<Typography className={classes.message}>
					No contents
				</Typography>
			}

			{posts.hasNext &&
				<Box className={classes.message}>
					<CircularProgress size={30} thickness={3} />
				</Box>
			}
		</List>
	)
}
