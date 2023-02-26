import React from 'react'
import { useRecoilValue } from 'recoil'

import Loading from '../components/Loading'
import Blog from '../components/blog/Blog'
import Index from '../components/index/Index'
import { initializedStatusState } from '../state/status'
import { currentBlogState } from '../state/currentBlog'

export default function Main() {
  const initialized = useRecoilValue(initializedStatusState)
  const currentBlog = useRecoilValue(currentBlogState)


	if (!initialized) {
		return <Loading />
  }
  
  if (currentBlog) {
    return <Blog />
  }

  return <Index />
}
