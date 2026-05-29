import React, { useEffect } from 'react'
import { useAtom, useAtomValue } from 'jotai'
import { ipcRenderer } from 'electron'

import { CircularProgress, List, Typography, Box, SxProps, Theme } from '@mui/material'

import PostListItem from '#/renderer/components/blog/sidebar/PostListItem'
import { currentAuthState, currentBlogState } from '#/renderer/state/currentBlog'
import { postsInitializedState, postsLockState, postsState } from '#/renderer/state/posts'
import { currentPostState } from '#/renderer/state/currentPost'
import { Post } from '#/renderer/types'

const styles = {
  root: {
    width: 300,
    overflow: 'auto'
  } as SxProps<Theme>,
  message: {
    textAlign: 'center',
    padding: (theme) => theme.spacing(2),
    color: '#aaa'
  } as SxProps<Theme>
}

export default function PostList() {
  const posts = useAtomValue(postsState)
  const [postsLock, setPostsLock] = useAtom(postsLockState)
  const postsInitialized = useAtomValue(postsInitializedState)
  const [currentPost, setCurrentPost] = useAtom(currentPostState)
  const currentAuth = useAtomValue(currentAuthState)
  const currentBlog = useAtomValue(currentBlogState)

  function requestNextPage() {
    if (!currentAuth || !currentBlog) return

    if (!postsLock && posts.hasNext) {
      setPostsLock(true)
      let options: any = undefined
      if (currentAuth.provider === 'tumblr') {
        options = {
          offset: posts.list.length,
          npf: true,
        }
      }
      console.log("fetch-posts", currentAuth, currentBlog, options)
      ipcRenderer.send('fetch-posts', currentAuth.uuid, currentBlog.name, options)
    }
  }

  function handleScroll(e: React.UIEvent<HTMLUListElement>) {
    const target = e.target as HTMLElement
    const { clientHeight, scrollHeight, scrollTop } = target

    if (clientHeight + scrollTop + 200 > scrollHeight) {
      requestNextPage()
    }
  }

  function handleSelectPost(item: Post) {
    if (currentPost && currentPost.id === item.id) {
      return
    }

    setCurrentPost(item)
  }

  useEffect(() => {
    if (!postsInitialized) {
      requestNextPage()
    }
  }, [posts, postsInitialized])
  
  return (
    <List onScroll={handleScroll} disablePadding={true} sx={styles.root}>
      {posts.list.map((item: Post, i) =>
        <PostListItem 
          key={i}
          post={item}
          selected={!!currentPost && item.id === currentPost.id}
          onSelect={handleSelectPost} 
        />
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
