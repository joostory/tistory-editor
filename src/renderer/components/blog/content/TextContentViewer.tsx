import React, { useEffect, useRef } from 'react'
import { useAtomValue } from 'jotai'
import dayjs from 'dayjs'
import { Chip, IconButton, Box, Divider, Typography, Container, SxProps, Theme } from '@mui/material'
import { OpenInBrowser, Edit } from '@mui/icons-material'
import highlightjs from 'highlight.js'
import 'highlight.js/styles/atom-one-dark.css'
import * as ContentHelper from '#/renderer/modules/ContentHelper'
import { pageview } from '#/renderer/modules/AnalyticsHelper'
import { currentBlogState } from '#/renderer/state/currentBlog'
import { currentPostState } from '#/renderer/state/currentPost'

const styles = {
  root: {
    margin: (theme) => theme.spacing(3),
    marginTop: (theme) => theme.spacing(5),
    marginBottom: (theme) => theme.spacing(5),
    background: '#fff',
    width: (theme: any) => theme.palette.content?.maxWidth || '800px',
    boxShadow: (theme) => theme.shadows[1],
    borderRadius: (theme) => theme.spacing(2),
  } as SxProps<Theme>,
  contentHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: (theme) => theme.spacing(2),
    paddingBottom: (theme) => theme.spacing(1),
    px: (theme) => theme.spacing(4),
  } as SxProps<Theme>,
  btnPostInfo: {
    color: '#555'
  } as SxProps<Theme>,
  icoPostInfo: {
    fontSize: 18
  } as SxProps<Theme>,
  divider: {
    backgroundColor: '#eee'
  } as SxProps<Theme>,
  contentContainer: {
    padding: (theme) => theme.spacing(2),
    paddingLeft: (theme) => theme.spacing(4),
    paddingRight: (theme) => theme.spacing(4),
    paddingBottom: (theme) => theme.spacing(5),
  } as SxProps<Theme>,
  tag: {
    marginRight: (theme) => theme.spacing(1),
    color: '#555',
    borderColor: '#ddd'
  } as SxProps<Theme>
}

interface TextContentViewerProps {
  onRequestEditPost: () => void
}

export default function TextContentViewer({ onRequestEditPost }: TextContentViewerProps) {
  const currentBlog = useAtomValue(currentBlogState)
  const post = useAtomValue(currentPostState)
  const viewerContent = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (post && currentBlog && viewerContent.current) {
      pageview(`/blog/${currentBlog.name}/post/${post.id}`, `${post.title}`)

      const codeElements = Array.from(viewerContent.current.querySelectorAll("pre code"))
      codeElements.forEach((pre) => {
        try {
          (highlightjs as any).highlightBlock(pre)
        } catch (e) {
          console.error("Failed to highlight block", e)
        }
      })
    }
  }, [post, currentBlog])

  if (!post || !currentBlog) {
    return null
  }

  const tags: string[] = post.tags || []

  return (
    <Box sx={styles.root}>
      <Box sx={styles.contentHeader}>
        <Typography variant='body2' sx={{ color: '#666' }}>
          {dayjs(post.date).format('YYYY-MM-DD HH:mm')}
        </Typography>

        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <IconButton sx={styles.btnPostInfo} href={post.url} title="브라우저에서 보기" size='small'>
            <OpenInBrowser sx={styles.icoPostInfo} />
          </IconButton>
          <IconButton sx={styles.btnPostInfo} onClick={onRequestEditPost} title="수정하기" size='small'>
            <Edit sx={styles.icoPostInfo} />
          </IconButton>
        </Box>
      </Box>
      <Divider sx={{ ...styles.divider } as SxProps<Theme>} />

      <Container disableGutters={true} sx={styles.contentContainer}>
        <div 
          ref={viewerContent}
          className="content"
          dangerouslySetInnerHTML={{ __html: ContentHelper.makeUrlBase(post.content) }}
        />

        <Box>
          {tags.map((item, i) =>
            <Chip key={i} variant='outlined' label={item} sx={styles.tag} />
          )}
        </Box>
      </Container>
    </Box>
  )
}
