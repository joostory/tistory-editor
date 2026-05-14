import React, { useEffect, useRef } from 'react'
import { useAtomValue } from 'jotai'
import 'highlight.js/styles/atom-one-dark.css'
import { ipcRenderer } from 'electron'
import TextContentViewer from './type/TextContentViewer'
import { currentAuthState, currentBlogState } from '../../../state/currentBlog'
import { currentPostState } from '../../../state/currentPost'


export default function TistoryContentViewer({onRequestEditPost}) {
  const currentAuth = useAtomValue(currentAuthState)
	const currentBlog = useAtomValue(currentBlogState)
  const post = useAtomValue(currentPostState)

  useEffect(() => {
    if (post && !post.fetched) {
      ipcRenderer.send("fetch-content", currentAuth.uuid, currentBlog.name, post.id)
    }
  }, [post])

  return (
    <TextContentViewer onRequestEditPost={onRequestEditPost} />
  )
}
