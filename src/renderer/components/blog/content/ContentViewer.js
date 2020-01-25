import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { pageview } from '../../../modules/AnalyticsHelper'
import TextContentViewer from './TextContentViewer'

function UnknownTypeContentViewer() {
  return (
    <div className='content_wrap'>
      <div className='viewer'>
        <div className="viewer_content content">
          죄송합니다. 아직 이런 형식의 글은 보여드릴 수 없습니다.
        </div>
      </div>
    </div>
  )
}


export default function ContentViewer({ onRequestEditPost }) {
  const currentBlog = useSelector(state => state.currentBlog)
  const post = useSelector(state => state.currentPost)

  useEffect(() => {
    if (post) {
      pageview(`/blog/${currentBlog.name}/post/${post.id}`, `${post.summary}`)
    }
  }, [post])

  switch(post.type) {
    case 'text':
      return <TextContentViewer onRequestEditPost={onRequestEditPost} />
    default:
      return <UnknownTypeContentViewer />
  }

}

