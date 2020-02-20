import React, { } from 'react'
import { useSelector } from 'react-redux'
import TumblrContentViewer from './TumblrContentViewer'
import TistoryContentViewer from './TistoryContentViewer'

function EmptyContent() {
  return (
    <div className="content_wrap">
      <div className="content_empty_message">Editor for Tumblr</div>
    </div>
  )
}


function ContentViewer({onRequestEditPost}) {
  const currentAuth = useSelector(state => state.currentAuth)

  if (currentAuth.provider == 'tistory') {
    return <TistoryContentViewer onRequestEditPost={onRequestEditPost} />
  } else if (currentAuth.provider == 'tumblr') {
    return <TumblrContentViewer onRequestEditPost={onRequestEditPost} />
  } else {
    return <EmptyContent />
  }
}

export default function Content({onRequestEditPost}) {
  const post = useSelector(state => state.currentPost)

  if (!post) {
    return <EmptyContent />
  } else {
    return <ContentViewer onRequestEditPost={onRequestEditPost} />
  }
}
