import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Fab } from '@material-ui/core'
import { Add } from '@material-ui/icons'
import Sidebar from './sidebar/Sidebar'
import Content from './content/Content'
import Editor from '../editor/Editor'
import * as ContentMode from '../../constants/ContentMode'
import { pageview } from '../../modules/AnalyticsHelper'

export default function Blog() {
	const currentBlog = useSelector(state => state.currentBlog)
  const [mode, setMode] = useState(ContentMode.VIEW)
  const [isEditorMode, setIsEditorMode] = useState(false)

	useEffect(() => {
		pageview(`/blog/${currentBlog.blogId}`, `${currentBlog.name}`)
  }, [])
  
  useEffect(() => {
    setIsEditorMode(mode === ContentMode.EDIT || mode === ContentMode.ADD)
  }, [mode])

  return (
    <div className="container">
      <Sidebar />
      <Content onRequestEditPost={() => setMode(ContentMode.EDIT)} />
      
      {!isEditorMode &&
        <Fab color='primary' className="btn_add" onClick={() => setMode(ContentMode.ADD)}>
          <Add />
        </Fab>
      }

      {isEditorMode &&
        <Editor
          mode={mode}
          onFinish={() => setMode(ContentMode.VIEW)}
        />
      }
    </div>
  )
}
