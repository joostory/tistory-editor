import React, { useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import dateformat from 'dateformat'
import { Chip, IconButton, Box, Divider, Typography, makeStyles, Container } from '@material-ui/core'
import { OpenInBrowser, Edit } from '@material-ui/icons'
import highlightjs from 'highlight.js'
import 'highlight.js/styles/atom-one-dark.css'
import * as ContentHelper from '../../../../modules/ContentHelper'
import { pageview } from '../../../../modules/AnalyticsHelper'

const useStyles = makeStyles(theme => ({
  root: {
    backgroundColor: '#fff',
    minHeight: '100vh'
  },
  title: {
    paddingTop: theme.spacing(5),
    paddingBottom: theme.spacing(2)
  },
  postInfo: {
    paddingBottom: theme.spacing(3),
    textAlign: 'center'
  },
  contentContainer: {
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(5)
  },
  tag: {
    marginRight: theme.spacing(1)
  }
}))


export default function TextContentViewer({ onRequestEditPost }) {
  const classes = useStyles()
  const currentBlog = useSelector(state => state.currentBlog)
  const post = useSelector(state => state.currentPost)
  const viewerContent = useRef(null)

  useEffect(() => {
    if (post) {
      pageview(`/blog/${currentBlog.name}/post/${post.id}`, `${post.title}`)
      
      Array.prototype.map.call(viewerContent.current.getElementsByTagName("pre"), pre => {
        highlightjs.highlightBlock(pre)
      })
    }
  }, [post])

  return (
    <Box className={classes.root}>
      <Container maxWidth='sm' disableGutters={true}>
        <Typography variant='h4' component='h1' align='center' className={classes.title}>
          {post.title}
        </Typography>

        <Box className={classes.postInfo}>
          <Typography component='span'>
            {dateformat(new Date(post.date), 'yyyy-mm-dd HH:MM')}
          </Typography>
          <IconButton href={post.url} tooltip="브라우저에서 보기" size='small'>
            <OpenInBrowser />
          </IconButton>
          <IconButton onClick={onRequestEditPost} tooltip="수정하기" size='small'>
            <Edit />
          </IconButton>
        </Box>
      </Container>

      <Divider />

      <Container maxWidth='sm' disableGutters={true} className={classes.contentContainer}>
        <div ref={viewerContent}
          className="content"
          dangerouslySetInnerHTML={{__html: ContentHelper.makeUrlBase(post.content)}}
        />

        <Box>
          {post.tags.map((item, i) =>
            <Chip key={i} variant='outlined' label={item} className={classes.tag} />
          )}
        </Box>
      </Container>
    </Box>
  )
}
