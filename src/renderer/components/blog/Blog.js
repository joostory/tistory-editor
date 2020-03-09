import React, { useState, useEffect } from 'react'
import { ipcRenderer } from 'electron'
import { useSelector } from 'react-redux'
import {
  Fab, Dialog, DialogTitle, DialogContent, Slide, Box,
  makeStyles
} from '@material-ui/core'
import { Add } from '@material-ui/icons'
import Sidebar from './sidebar/Sidebar'
import Content from './content/Content'
import Editor from '../editor/Editor'
import * as ContentMode from '../../constants/ContentMode'
import { pageview } from '../../modules/AnalyticsHelper'
import BlogList from '../index/BlogList'
import AuthButton from '../index/AuthButton'


const useStyles = makeStyles(theme => ({
  root: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    overflow: 'hidden'
  },
  btnAdd: {
    position: 'fixed',
    right: theme.spacing(3),
    bottom: theme.spacing(3)
  },
  editor: {
    position: 'fixed',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 1300,
    backgroundColor: theme.palette.background.default,
    overflowY: 'scroll'
  }
}))

function BlogListDialog({open, onClose}) {
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

function EditorDialog({mode, onClose}) {
  const classes = useStyles()
  return (
    <Box className={classes.editor}>
      <Editor
        mode={mode}
        onFinish={onClose}
      />
    </Box>
  )
}

export default function Blog() {
  const classes = useStyles()
  const currentAuth = useSelector(state => state.currentAuth)
	const currentBlog = useSelector(state => state.currentBlog)
  const [contentMode, setContentMode] = useState(ContentMode.VIEW)
  const [openEditor, setOpenEditor] = useState(false)
  const [openBlogSelector, setOpenBlogSelector] = useState(!currentBlog)

	useEffect(() => {
    pageview(`/blog/${currentBlog.blogId}`, `${currentBlog.name}`)
    ipcRenderer.send('fetch-categories', currentAuth.uuid, currentBlog.name)
  }, [currentBlog])
  
  useEffect(() => {
    setOpenEditor(contentMode === ContentMode.EDIT || contentMode === ContentMode.ADD)
  }, [contentMode])

  return (
    <Box className={classes.root}>
      <Sidebar onSelectBlog={() => setOpenBlogSelector(true)} />
      <Content onRequestEditPost={() => setContentMode(ContentMode.EDIT)} />
      
      {currentBlog && !openEditor &&
        <Fab color='primary' className={classes.btnAdd} onClick={() => setContentMode(ContentMode.ADD)}>
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
