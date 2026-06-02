import React, { useState, useEffect } from 'react'
import { ipcRenderer } from 'electron'
import { useAtomValue } from 'jotai'
import {
  Fab, Dialog, DialogTitle, DialogContent, Box, SxProps, Theme
} from '@mui/material'
import { Add } from '@mui/icons-material'
import Sidebar from '#/renderer/components/blog/sidebar/Sidebar'
import Content from '#/renderer/components/blog/content/Content'
import Editor from '#/renderer/components/editor/Editor'
import * as ContentMode from '#/renderer/constants/ContentMode'
import { pageview } from '#/renderer/modules/AnalyticsHelper'
import BlogList from '#/renderer/components/index/BlogList'
import AuthButton from '#/renderer/components/index/AuthButton'
import { currentAuthState, currentBlogState } from '#/renderer/state/currentBlog'

const styles = {
  root: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    overflow: 'hidden'
  } as SxProps<Theme>,
  btnAdd: {
    position: 'fixed',
    right: (theme) => theme.spacing(3),
    bottom: (theme) => theme.spacing(3)
  } as SxProps<Theme>,
  editor: {
    position: 'fixed',
    left: 0,
    right: 0,
    top: '38px',
    bottom: 0,
    zIndex: 1300,
    backgroundColor: (theme) => theme.palette.background.default,
    overflowY: 'scroll',
  } as SxProps<Theme>
}

interface BlogListDialogProps {
  open: boolean
  onClose: () => void
}

function BlogListDialog({ open, onClose }: BlogListDialogProps) {
  return (
    <Dialog open={open} scroll="paper" onClose={onClose}>
      <DialogTitle>
        블로그 선택
      </DialogTitle>
      <DialogContent>
        <BlogList afterSelect={onClose} />
        <AuthButton />
      </DialogContent>
    </Dialog>
  )
}

interface EditorDialogProps {
  mode: string
  onClose: () => void
}

function EditorDialog({ mode, onClose }: EditorDialogProps) {
  return (
    <Box sx={styles.editor}>
      <Editor
        mode={mode}
        onFinish={onClose}
      />
    </Box>
  )
}

export default function Blog() {
  const currentAuth = useAtomValue(currentAuthState)
  const currentBlog = useAtomValue(currentBlogState)
  const [contentMode, setContentMode] = useState<string>(ContentMode.VIEW)
  const [openEditor, setOpenEditor] = useState<boolean>(false)
  const [openBlogSelector, setOpenBlogSelector] = useState<boolean>(!currentBlog)

  useEffect(() => {
    if (currentBlog && currentAuth) {
      pageview(`/blog/${currentBlog.name}`, `${currentBlog.title}`)
      ipcRenderer.send('fetch-categories', currentAuth.uuid, currentBlog.name)
    }
  }, [currentAuth?.uuid, currentBlog?.name])
  
  useEffect(() => {
    setOpenEditor(contentMode === ContentMode.EDIT || contentMode === ContentMode.ADD)
  }, [contentMode])

  if (!currentBlog || !currentAuth) {
    return null
  }

  return (
    <Box sx={styles.root}>
      <Sidebar onSelectBlog={() => setOpenBlogSelector(true)} />
      <Content onRequestEditPost={() => setContentMode(ContentMode.EDIT)} />
      
      {currentBlog && !openEditor &&
        <Fab color='primary' sx={styles.btnAdd} onClick={() => setContentMode(ContentMode.ADD)}>
          <Add />
        </Fab>
      }

      <BlogListDialog
        open={openBlogSelector}
        onClose={() => setOpenBlogSelector(false)}
      />

      {openEditor &&
        <EditorDialog
          mode={contentMode}
          onClose={() => setContentMode(ContentMode.VIEW)}
        />
      }
    </Box>
  )
}
