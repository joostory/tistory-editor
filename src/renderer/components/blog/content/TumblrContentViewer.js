import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { pageview } from '../../../modules/AnalyticsHelper'
import TextContentViewer from './type/TextContentViewer'
import PhotoContentViewer from './type/PhotoContentViewer'
import { Typography } from '@mui/material'
import { makeStyles } from '@mui/styles'

const useStyles = makeStyles(theme => ({
  emtpyMessage: {
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }
}))

function UnknownTypeContentViewer() {
  const classes = useStyles()
  return (
    <Typography className={classes.emtpyMessage} color='textSecondary'>
      죄송합니다. 아직 이런 형식의 글은 보여드릴 수 없습니다.
    </Typography>
  )
}


export default function TumblrContentViewer({ onRequestEditPost }) {
  const currentBlog = useSelector(state => state.currentBlog)
  const post = useSelector(state => state.currentPost)

  useEffect(() => {
    if (post) {
      pageview(`/blog/${currentBlog.name}/post/${post.id}`, `${post.title}`)
    }
  }, [post])

  switch(post.type) {
    case 'text':
      return <TextContentViewer onRequestEditPost={onRequestEditPost} />
    case 'photo':
      return <PhotoContentViewer />
    default:
      return <UnknownTypeContentViewer />
  }
}

