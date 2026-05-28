import React, { useEffect } from 'react'
import { pageview } from '../../../modules/AnalyticsHelper'
import TextContentViewer from './type/TextContentViewer'
import { Typography, SxProps, Theme } from '@mui/material'
import { useAtomValue } from 'jotai'
import { currentBlogState } from '../../../state/currentBlog'
import { currentPostState } from '../../../state/currentPost'

const styles = {
  emtpyMessage: {
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  } as SxProps<Theme>
}

function UnknownTypeContentViewer() {
  return (
    <Typography sx={styles.emtpyMessage} color='textSecondary'>
      죄송합니다. 아직 이런 형식의 글은 보여드릴 수 없습니다.
    </Typography>
  )
}

interface TumblrContentViewerProps {
  onRequestEditPost: () => void
}

export default function TumblrContentViewer({ onRequestEditPost }: TumblrContentViewerProps) {
  const currentBlog = useAtomValue(currentBlogState)
  const post = useAtomValue(currentPostState)

  useEffect(() => {
    if (post && currentBlog) {
      pageview(`/blog/${currentBlog.name}/post/${post.id}`, `${post.title}`)
    }
  }, [post, currentBlog])

  if (!currentBlog || !post) {
    return null
  }

  return <TextContentViewer onRequestEditPost={onRequestEditPost} />
}
