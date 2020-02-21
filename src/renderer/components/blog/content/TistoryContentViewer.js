import React, { useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import 'highlight.js/styles/atom-one-dark.css'
import { ipcRenderer } from 'electron'
import TextContentViewer from './TextContentViewer'


export default function TistoryContentViewer({onRequestEditPost}) {
  const currentAuth = useSelector(state => state.currentAuth)
  const currentBlog = useSelector(state => state.currentBlog)
  const post = useSelector(state => state.currentPost)

  useEffect(() => {
    if (post && !post.fetched) {
      ipcRenderer.send("fetch-content", currentAuth.uuid, currentBlog.name, post.id)
    }
  }, [post])

  return (
    <TextContentViewer onRequestEditPost={onRequestEditPost} />
  )
}
