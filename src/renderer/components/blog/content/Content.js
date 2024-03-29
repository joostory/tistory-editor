import React, { } from 'react'
import { useRecoilValue } from 'recoil'
import TumblrContentViewer from './TumblrContentViewer'
import TistoryContentViewer from './TistoryContentViewer'
import { Box, Typography } from '@mui/material'
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
  },
  emtpyMessage: {
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }
}

function EmptyContent() {
  return (
    <Typography sx={styles.emtpyMessage} color='textSecondary'>
      Editor
    </Typography>
  )
}


function ContentViewer({onRequestEditPost}) {
  const post = useRecoilValue(currentPostState)
  const currentAuth = useRecoilValue(currentAuthState)

  if (!post) {
    return <EmptyContent />
  }

  if (currentAuth.provider == 'tistory') {
    return <TistoryContentViewer onRequestEditPost={onRequestEditPost} />
  } else if (currentAuth.provider == 'tumblr') {
    return <TumblrContentViewer onRequestEditPost={onRequestEditPost} />
  } else {
    return <EmptyContent />
  }
}

export default function Content({onRequestEditPost}) {
  return (
    <Box sx={styles.container}>
      <ContentViewer onRequestEditPost={onRequestEditPost} />
    </Box>
  )
}
