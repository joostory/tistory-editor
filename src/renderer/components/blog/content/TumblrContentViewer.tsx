import React, { useEffect } from 'react'
import { pageview } from '#/renderer/modules/AnalyticsHelper'
import TextContentViewer from '#/renderer/components/blog/content/TextContentViewer'
import { useAtomValue } from 'jotai'
import { currentBlogState } from '#/renderer/state/currentBlog'
import { currentPostState } from '#/renderer/state/currentPost'


interface TumblrContentViewerProps {
  onRequestEditPost: () => void
}

export default function TumblrContentViewer({ onRequestEditPost }: TumblrContentViewerProps) {
  const currentBlog = useAtomValue(currentBlogState)
  const post = useAtomValue(currentPostState)

  useEffect(() => {
    if (post && currentBlog) {
      pageview(`/blog/${currentBlog.name}/post/${post.id}`, `${post.title}`)
    }
  }, [post, currentBlog])

  if (!currentBlog || !post) {
    return null
  }

  return <TextContentViewer onRequestEditPost={onRequestEditPost} />
}
