import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Fab, Dialog, DialogTitle, DialogContent, Slide, List, ListItem } from '@material-ui/core'
import { Add } from '@material-ui/icons'
import Sidebar from './sidebar/Sidebar'
import Content from './content/Content'
import Editor from '../editor/Editor'
import * as ContentMode from '../../constants/ContentMode'
import { pageview } from '../../modules/AnalyticsHelper'
import BlogList from '../index/BlogList'


const Transition = React.forwardRef((props, ref) =>
  <Slide direction="up" ref={ref} {...props} />
)

function BlogListDialog({open, onClose}) {
  return (
    <Dialog open={open} scroll="paper" onClose={onClose}>
      <DialogTitle>
        블로그 선택
      </DialogTitle>
      <DialogContent>
        <BlogList afterSelect={onClose} />
      </DialogContent>
    </Dialog>
  )
}

function EditorDialog({open, mode, onClose}) {
  return (
    <Dialog fullscreen open={open} onClose={onClose} TransitionComponent={Transition}>
      <Editor
        mode={mode}
        onFinish={onClose}
      />
    </Dialog>
  )
}

export default function Blog() {
	const currentBlog = useSelector(state => state.currentBlog)
  const [contentMode, setContentMode] = useState(ContentMode.VIEW)
  const [openEditor, setOpenEditor] = useState(false)
  const [openBlogSelector, setOpenBlogSelector] = useState(!currentBlog)

	useEffect(() => {
    if (currentBlog) {
      pageview(`/blog/${currentBlog.blogId}`, `${currentBlog.name}`)
    }
  }, [])
  
  useEffect(() => {
    setOpenEditor(contentMode === ContentMode.EDIT || contentMode === ContentMode.ADD)
  }, [contentMode])

  return (
    <div className="container">
      <Sidebar onSelectBlog={() => setOpenBlogSelector(true)} />
      <Content onRequestEditPost={() => setContentMode(ContentMode.EDIT)} />
      
      {currentBlog && !openEditor &&
        <Fab color='primary' className="btn_add" onClick={() => setContentMode(ContentMode.ADD)}>
          <Add />
        </Fab>
      }

      <BlogListDialog
        open={openBlogSelector}
        onClose={() => setOpenBlogSelector(false)}
      />

      <EditorDialog
        open={openEditor}
        mode={contentMode}
        onClose={() => setContentMode(ContentMode.VIEW)}
      />
    </div>
  )
}
