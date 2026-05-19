import React, { useEffect } from 'react'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { Routes, Route, useNavigate, useLocation, useParams } from 'react-router-dom'

import Loading from '../components/Loading'
import Blog from '../components/blog/Blog'
import Index from '../components/index/Index'
import { initializedStatusState } from '../state/status'
import { accountsState } from '../state/accounts'
import { currentAuthState, currentBlogCategoriesState, currentBlogState, INITIAL_CATEGORIES } from '../state/currentBlog'
import { INITIAL_POSTS, postsInitializedState, postsLockState, postsState } from '../state/posts'
import { currentPostState, INITIAL_CURRENT_POST } from '../state/currentPost'

function BlogRouteWrapper() {
  const { blogName } = useParams()
  const accounts = useAtomValue(accountsState)
  const [currentBlog, setCurrentBlog] = useAtom(currentBlogState)
  const currentAuth = useAtomValue(currentAuthState)
  const setCurrentAuth = useSetAtom(currentAuthState)
  const setPosts = useSetAtom(postsState)
  const setPostsInitialized = useSetAtom(postsInitializedState)
  const setPostsLock = useSetAtom(postsLockState)
  const setCurrentBlogCategories = useSetAtom(currentBlogCategoriesState)
  const setCurrentPost = useSetAtom(currentPostState)
  const navigate = useNavigate()

  useEffect(() => {
    if (!accounts || accounts.length === 0) return

    // URL 상의 blogName에 매칭되는 블로그 찾기
    let foundAuth = null
    let foundBlog = null

    for (const account of accounts) {
      const blog = account.blogs.find(b => b.name === decodeURIComponent(blogName))
      if (blog) {
        foundAuth = account.auth
        foundBlog = blog
        break
      }
    }

    if (foundBlog) {
      // 현재 상태와 매칭된 블로그가 다른 경우 상태 업데이트 (뒤로가기/앞으로가기/직접 이동 대응)
      if (!currentBlog || currentBlog.name !== foundBlog.name) {
        setCurrentAuth(foundAuth)
        setCurrentBlog(foundBlog)
        setCurrentBlogCategories(INITIAL_CATEGORIES)
        setPosts(INITIAL_POSTS)
        setPostsInitialized(false)
        setPostsLock(false)
        setCurrentPost(INITIAL_CURRENT_POST)
      }
    } else {
      // 매칭되는 블로그가 없으면 홈으로 리다이렉트
      navigate('/', { replace: true })
    }
  }, [blogName, accounts, currentBlog, setCurrentAuth, setCurrentBlog, setCurrentBlogCategories, setPosts, setPostsInitialized, setPostsLock, setCurrentPost, navigate])

  if (!accounts || accounts.length === 0 || !currentBlog || currentBlog.name !== decodeURIComponent(blogName) || !currentAuth) {
    return <Loading />
  }

  return <Blog />
}

export default function Main() {
  const initialized = useAtomValue(initializedStatusState)
  const currentBlog = useAtomValue(currentBlogState)
  const setCurrentBlog = useSetAtom(currentBlogState)
  const setCurrentAuth = useSetAtom(currentAuthState)
  const setPosts = useSetAtom(postsState)
  const setPostsInitialized = useSetAtom(postsInitializedState)
  const setPostsLock = useSetAtom(postsLockState)
  const setCurrentBlogCategories = useSetAtom(currentBlogCategoriesState)
  const setCurrentPost = useSetAtom(currentPostState)

  const navigate = useNavigate()
  const location = useLocation()

  // 1. Jotai 상태 변경 -> URL 동기화
  useEffect(() => {
    if (!initialized) {
      if (location.pathname !== '/loading') {
        navigate('/loading', { replace: true })
      }
    } else if (currentBlog) {
      const targetPath = `/blog/${encodeURIComponent(currentBlog.name)}`
      if (location.pathname !== targetPath) {
        navigate(targetPath)
      }
    } else {
      if (location.pathname !== '/' && !location.pathname.startsWith('/blog/')) {
        navigate('/', { replace: true })
      }
    }
  }, [initialized, currentBlog, navigate, location.pathname])

  // 2. URL이 홈(/)으로 복귀 시 Jotai 블로그 상태 초기화 (뒤로가기로 홈 진입 시 대응)
  useEffect(() => {
    if (initialized && location.pathname === '/' && currentBlog) {
      setCurrentAuth(null)
      setCurrentBlog(null)
      setCurrentBlogCategories(INITIAL_CATEGORIES)
      setPosts(INITIAL_POSTS)
      setPostsInitialized(false)
      setPostsLock(false)
      setCurrentPost(INITIAL_CURRENT_POST)
    }
  }, [initialized, location.pathname, currentBlog, setCurrentAuth, setCurrentBlog, setCurrentBlogCategories, setPosts, setPostsInitialized, setPostsLock, setCurrentPost])

  if (!initialized) {
    return <Loading />
  }

  return (
    <Routes>
      <Route path="/loading" element={<Loading />} />
      <Route path="/blog/:blogName" element={<BlogRouteWrapper />} />
      <Route path="/" element={<Index />} />
    </Routes>
  )
}
