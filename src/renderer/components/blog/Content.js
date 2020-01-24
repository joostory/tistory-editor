import React, { } from 'react'
import { useSelector } from 'react-redux'
import ContentViewer from './ContentViewer'

function EmptyContent() {
  return (
    <div className="content_wrap">
      <div className="content_empty_message">Editor for Tumblr</div>
    </div>
  )
}


export default function Content({onRequestEditPost}) {
  const post = useSelector(state => state.currentPost)

  if (!post) {
    return <EmptyContent />
  } else {
    return <ContentViewer onRequestEditPost={onRequestEditPost} />
  }
}
