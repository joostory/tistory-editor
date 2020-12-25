import React, { useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import dayjs from 'dayjs'
import { Chip, IconButton, Box, Divider, Typography, makeStyles, Container } from '@material-ui/core'
import { OpenInBrowser, Edit } from '@material-ui/icons'
import highlightjs from 'highlight.js'
import 'highlight.js/styles/atom-one-dark.css'
import * as ContentHelper from '../../../../modules/ContentHelper'
import { pageview } from '../../../../modules/AnalyticsHelper'

const useStyles = makeStyles(theme => ({
  root: {
    margin: theme.spacing(3),
    marginTop: theme.spacing(5),
    marginBottom: theme.spacing(5),
    background: theme.palette.content.background,
    width: theme.palette.content.maxWidth,
    boxShadow: theme.shadows[1],
    borderRadius: theme.spacing(0.5)
  },
  title: {
    paddingTop: theme.spacing(5),
    paddingBottom: theme.spacing(2),
    color: theme.palette.content.text
  },
  postInfo: {
    paddingBottom: theme.spacing(3),
    textAlign: 'center',
    color: theme.palette.content.text
  },
  postInfoButton: {
    color: theme.palette.content.text
  },
  divider: {
    backgroundColor: theme.palette.content.divider
  },
  contentContainer: {
    padding: theme.spacing(3),
    paddingLeft: theme.spacing(5),
    paddingRight: theme.spacing(5),
    paddingBottom: theme.spacing(5)
  },
  tag: {
    marginRight: theme.spacing(1),
    color: theme.palette.content.text,
    borderColor: theme.palette.content.tagBorder
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

      Array.prototype.map.call(viewerContent.current.querySelectorAll("pre code"), pre => {
        highlightjs.highlightBlock(pre)
      })
    }
  }, [post])

  return (
    <Box className={classes.root}>
      <Container disableGutters={true}>
        <Typography variant='h4' component='h1' align='center' className={classes.title}>
          {post.title}
        </Typography>

        <Box className={classes.postInfo}>
          <Typography component='span'>
            {dayjs(post.date).format('YYYY-MM-DD HH:mm')}
          </Typography>
          <IconButton className={classes.postInfoButton} href={post.url} tooltip="브라우저에서 보기" size='small'>
            <OpenInBrowser />
          </IconButton>
          <IconButton className={classes.postInfoButton} onClick={onRequestEditPost} tooltip="수정하기" size='small'>
            <Edit />
          </IconButton>
        </Box>
      </Container>

      <Divider className={classes.divider} />

      <Container disableGutters={true} className={classes.contentContainer}>
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
