import React from 'react'
import { useAtomValue } from 'jotai'
import TumblrContentViewer from './TumblrContentViewer'
import { Box, Typography, SxProps, Theme } from '@mui/material'
import { currentAuthState } from '../../../state/currentBlog'
import { currentPostState } from '../../../state/currentPost'

const styles = {
  container: {
    position: 'fixed',
    left: 300,
    right: 0,
    top: 0,
    bottom: 0,
    overflow: 'auto',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'start'
  } as SxProps<Theme>,
  emtpyMessage: {
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  } as SxProps<Theme>
}

function EmptyContent() {
  return (
    <Typography sx={styles.emtpyMessage} color='textSecondary'>
      Editor
    </Typography>
  )
}

interface ContentProps {
  onRequestEditPost: () => void
}

function ContentViewer({ onRequestEditPost }: ContentProps) {
  const post = useAtomValue(currentPostState)
  const currentAuth = useAtomValue(currentAuthState)

  if (!post) {
    return <EmptyContent />
  }

  if (currentAuth && currentAuth.provider === 'tumblr') {
    return <TumblrContentViewer onRequestEditPost={onRequestEditPost} />
  } else {
    return <EmptyContent />
  }
}

export default function Content({ onRequestEditPost }: ContentProps) {
  return (
    <Box sx={styles.container}>
      <ContentViewer onRequestEditPost={onRequestEditPost} />
    </Box>
  )
}
