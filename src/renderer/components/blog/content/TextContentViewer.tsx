import React, { useEffect, useRef } from 'react'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import dayjs from 'dayjs'
import { ipcRenderer } from 'electron'
import { Chip, IconButton, Box, Divider, Typography, Container, SxProps, Theme, Tooltip } from '@mui/material'
import { OpenInBrowser, Edit, Delete } from '@mui/icons-material'
import highlightjs from 'highlight.js'
import 'highlight.js/styles/atom-one-dark.css'
import * as ContentHelper from '#/renderer/modules/ContentHelper'
import { pageview } from '#/renderer/modules/AnalyticsHelper'
import { currentAuthState, currentBlogState } from '#/renderer/state/currentBlog'
import { currentPostState } from '#/renderer/state/currentPost'
import { postsState } from '#/renderer/state/posts'

const styles = {
  root: {
    margin: (theme) => theme.spacing(3),
    marginBottom: (theme) => theme.spacing(8),
    background: '#fff',
    width: (theme: any) => theme.palette.content?.maxWidth || '800px',
    boxShadow: (theme) => theme.shadows[1],
    borderRadius: (theme) => theme.spacing(2),
  } as SxProps<Theme>,
  contentHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: (theme) => theme.spacing(1),
    paddingBottom: (theme) => theme.spacing(1),
    px: (theme) => theme.spacing(2),
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
    padding: (theme) => theme.spacing(3),
    paddingLeft: (theme) => theme.spacing(4),
    paddingRight: (theme) => theme.spacing(4),
    paddingBottom: (theme) => theme.spacing(5),
  } as SxProps<Theme>,
  tag: {
    color: '#666',
    backgroundColor: '#f1f3f5',
    border: 'none',
    fontWeight: 500,
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: '#e9ecef',
      color: '#333'
    }
  } as SxProps<Theme>
}

interface TextContentViewerProps {
  onRequestEditPost: () => void
}

export default function TextContentViewer({ onRequestEditPost }: TextContentViewerProps) {
  const currentAuth = useAtomValue(currentAuthState)
  const currentBlog = useAtomValue(currentBlogState)
  const [post, setPost] = useAtom(currentPostState)
  const setPosts = useSetAtom(postsState)
  const viewerContent = useRef<HTMLDivElement>(null)

  function handleDeletePost() {
    if (!post || !currentAuth || !currentBlog) return
    if (confirm("정말로 이 글을 삭제하시겠습니까?")) {
      ipcRenderer.send("delete-content", currentAuth.uuid, currentBlog.name, post.id)
    }
  }

  useEffect(() => {
    function handleFinishDelete(_e: any, deletedPostId: string) {
      if (deletedPostId) {
        setPosts((prev: any) => ({
          ...prev,
          list: prev.list.filter((item: any) => item.id != deletedPostId)
        }))
        setPost(null)
      }
    }

    ipcRenderer.on("finish-delete-content", handleFinishDelete)
    return () => {
      ipcRenderer.removeListener("finish-delete-content", handleFinishDelete)
    }
  }, [setPosts, setPost])

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
          <Tooltip title="브라우저에서 보기" placement="top">
            <IconButton sx={styles.btnPostInfo} href={post.url} size='small'>
              <OpenInBrowser sx={styles.icoPostInfo} />
            </IconButton>
          </Tooltip>
          <Tooltip title="수정하기" placement="top">
            <IconButton sx={styles.btnPostInfo} onClick={onRequestEditPost} size='small'>
              <Edit sx={styles.icoPostInfo} />
            </IconButton>
          </Tooltip>
          <Tooltip title="삭제하기" placement="top">
            <IconButton sx={styles.btnPostInfo} onClick={handleDeletePost} size='small'>
              <Delete sx={styles.icoPostInfo} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      <Divider sx={{ ...styles.divider } as SxProps<Theme>} />

      <Container disableGutters={true} sx={styles.contentContainer}>
        <div 
          ref={viewerContent}
          className="content"
          dangerouslySetInnerHTML={{ __html: ContentHelper.makeUrlBase(post.content) }}
        />

        {tags.length > 0 && (
          <Box sx={{ mt: 5, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {tags.map((item, i) =>
              <Chip key={i} size="small" label={`#${item}`} sx={styles.tag} />
            )}
          </Box>
        )}
      </Container>
    </Box>
  )
}
