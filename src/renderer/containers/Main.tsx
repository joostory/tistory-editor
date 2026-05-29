import React, { useEffect } from 'react'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { Routes, Route, useNavigate, useLocation, useParams } from 'react-router-dom'

import Loading from '#/renderer/components/Loading'
import Blog from '#/renderer/components/blog/Blog'
import Index from '#/renderer/components/index/Index'
import { initializedStatusState } from '#/renderer/state/status'
import { accountsState } from '#/renderer/state/accounts'
import { currentAuthState, currentBlogCategoriesState, currentBlogState, INITIAL_CATEGORIES } from '#/renderer/state/currentBlog'
import { INITIAL_POSTS, postsInitializedState, postsLockState, postsState } from '#/renderer/state/posts'
import { currentPostState, INITIAL_CURRENT_POST } from '#/renderer/state/currentPost'

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

function IndexRouteWrapper() {
  const setCurrentBlog = useSetAtom(currentBlogState)
  const setCurrentAuth = useSetAtom(currentAuthState)
  const setPosts = useSetAtom(postsState)
  const setPostsInitialized = useSetAtom(postsInitializedState)
  const setPostsLock = useSetAtom(postsLockState)
  const setCurrentBlogCategories = useSetAtom(currentBlogCategoriesState)
  const setCurrentPost = useSetAtom(currentPostState)

  useEffect(() => {
    // 홈 화면 진입 시 블로그 관련 상태들을 자연스럽게 정리
    setCurrentAuth(null)
    setCurrentBlog(null)
    setCurrentBlogCategories(INITIAL_CATEGORIES)
    setPosts(INITIAL_POSTS)
    setPostsInitialized(false)
    setPostsLock(false)
    setCurrentPost(INITIAL_CURRENT_POST)
  }, [setCurrentAuth, setCurrentBlog, setCurrentBlogCategories, setPosts, setPostsInitialized, setPostsLock, setCurrentPost])

  return <Index />
}

export default function Main() {
  const initialized = useAtomValue(initializedStatusState)
  const navigate = useNavigate()
  const location = useLocation()

  // 앱 초기화 상태 동기화
  useEffect(() => {
    if (!initialized) {
      if (location.pathname !== '/loading') {
        navigate('/loading', { replace: true })
      }
    } else {
      if (location.pathname === '/loading') {
        navigate('/', { replace: true })
      }
    }
  }, [initialized, navigate, location.pathname])

  if (!initialized) {
    return <Loading />
  }

  return (
    <Routes>
      <Route path="/loading" element={<Loading />} />
      <Route path="/blog/:blogName" element={<BlogRouteWrapper />} />
      <Route path="/" element={<IndexRouteWrapper />} />
    </Routes>
  )
}
