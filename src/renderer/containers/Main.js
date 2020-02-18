import React from 'react'
import { useSelector } from 'react-redux'

import Loading from '../components/Loading'
import Blog from '../components/blog/Blog'
import Index from '../components/index/Index'

export default function Main() {
  const status = useSelector(state => state.status)
	const currentBlog = useSelector(state => state.currentBlog)


	if (!status.initialized) {
		return <Loading />
  }
  
  if (currentBlog) {
    return <Blog />
  }

  return <Index />
}
