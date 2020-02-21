import React, { } from 'react'
import { useSelector } from 'react-redux'
import TumblrContentViewer from './TumblrContentViewer'
import TistoryContentViewer from './TistoryContentViewer'
import { Box, Typography, makeStyles } from '@material-ui/core'

const useStyles = makeStyles(theme => ({
  container: {
    position: 'fixed',
    left: 300,
    right: 0,
    top: 0,
    bottom: 0,
    overflow: 'auto'
  },
  emtpyMessage: {
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }
}))

function EmptyContent() {
  const classes = useStyles()
  return (
    <Typography className={classes.emtpyMessage} color='textSecondary'>
      Editor
    </Typography>
  )
}


function ContentViewer({onRequestEditPost}) {
  const post = useSelector(state => state.currentPost)
  const currentAuth = useSelector(state => state.currentAuth)

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
  const classes = useStyles()
  return (
    <Box className={classes.container}>
      <ContentViewer onRequestEditPost={onRequestEditPost} />
    </Box>
  )
}
