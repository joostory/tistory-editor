import React, { useState, useEffect, useRef } from 'react'
import { useRecoilValue } from 'recoil'
import dayjs from 'dayjs'
import { Chip, IconButton, Box, Divider, Typography, Container } from '@mui/material'
import { OpenInBrowser, Edit } from '@mui/icons-material'
import highlightjs from 'highlight.js'
import 'highlight.js/styles/atom-one-dark.css'
import * as ContentHelper from '../../../../modules/ContentHelper'
import { pageview } from '../../../../modules/AnalyticsHelper'
import { currentBlogState } from '../../../../state/currentBlog'
import { currentPostState } from '../../../../state/currentPost'

const styles = {
  root: {
    margin: (theme) => theme.spacing(3),
    marginTop: (theme) => theme.spacing(5),
    marginBottom: (theme) => theme.spacing(5),
    background: (theme) => theme.palette.content.background,
    width: (theme) => theme.palette.content.maxWidth,
    boxShadow: (theme) => theme.shadows[1],
    borderRadius: (theme) => theme.spacing(0.5),
    paddingLeft: (theme) => theme.spacing(2),
    paddingRight: (theme) => theme.spacing(2),
  },
  title: {
    paddingTop: (theme) => theme.spacing(5),
    paddingBottom: (theme) => theme.spacing(2),
    color: (theme) => theme.palette.content.text
  },
  postInfo: {
    paddingBottom: (theme) => theme.spacing(3),
    textAlign: 'center',
    color: (theme) => theme.palette.content.text
  },
  divContainer: {
    position: 'relative',
    paddingTop: '12px'
  },
  btnBox: {
    position: 'absolute',
    left: '50%',
    top: 0,
    transform: 'translate(-50%, 0)',
    backgroundColor: '#fff',
    padding: '0 10px'
  },
  btnPostInfo: {
    color: (theme) => theme.palette.content.text
  },
  icoPostInfo: {
    fontSize: 18
  },
  divider: {
    backgroundColor: (theme) => theme.palette.content.divider
  },
  contentContainer: {
    padding: (theme) => theme.spacing(3),
    paddingLeft: (theme) => theme.spacing(5),
    paddingRight: (theme) => theme.spacing(5),
    paddingBottom: (theme) => theme.spacing(5)
  },
  tag: {
    marginRight: (theme) => theme.spacing(1),
    color: (theme) => theme.palette.content.text,
    borderColor: (theme) => theme.palette.content.tagBorder
  }
}


export default function TextContentViewer({ onRequestEditPost }) {
  const currentBlog = useRecoilValue(currentBlogState)
  const post = useRecoilValue(currentPostState)
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
    <Box sx={styles.root}>
      <Container disableGutters={true}>
        <Typography variant='h4' component='h1' align='center' sx={styles.title}>
          {post.title}
        </Typography>

        <Box sx={styles.postInfo}>
          <Typography component='span'>
            {dayjs(post.date).format('YYYY-MM-DD HH:mm')}
          </Typography>
        </Box>
      </Container>

      <Container disableGutters={false} sx={styles.divContainer}>
        <Box sx={styles.btnBox}>
          <IconButton sx={styles.btnPostInfo} href={post.url} tooltip="브라우저에서 보기" size='small'>
            <OpenInBrowser sx={styles.icoPostInfo} />
          </IconButton>
          <IconButton sx={styles.btnPostInfo} onClick={onRequestEditPost} tooltip="수정하기" size='small'>
            <Edit sx={styles.icoPostInfo} />
          </IconButton>
        </Box>
        <Divider sx={styles.divider} />
      </Container>

      <Container disableGutters={true} sx={styles.contentContainer}>
        <div ref={viewerContent}
          className="content"
          dangerouslySetInnerHTML={{__html: ContentHelper.makeUrlBase(post.content)}}
        />

        <Box>
          {post.tags.map((item, i) =>
            <Chip key={i} variant='outlined' label={item} sx={styles.tag} />
          )}
        </Box>
      </Container>
    </Box>
  )
}
