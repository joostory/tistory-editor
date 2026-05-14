import React, { useEffect } from 'react'
import { ipcRenderer } from 'electron'
import { useSetAtom } from 'jotai'
import { preferencesState } from '../state/preferences'
import { initializedStatusState } from '../state/status'
import { accountsState } from '../state/accounts'
import { currentBlogCategoriesState } from '../state/currentBlog'
import { postsInitializedState, postsLockState, postsState } from '../state/posts'
import { currentPostState } from '../state/currentPost'


export default function IpcEventReceiver() {
  const setPreferences = useSetAtom(preferencesState)
  const setAccounts = useSetAtom(accountsState)
  const setInitializedStatus = useSetAtom(initializedStatusState)
  const setCurrentBlogCategories = useSetAtom(currentBlogCategoriesState)
  const setPosts = useSetAtom(postsState)
  const setPostsLock = useSetAtom(postsLockState)
  const setPostsInitialized = useSetAtom(postsInitializedState)
  const setCurrentPost = useSetAtom(currentPostState)

  const handleAddAccount = (account) => {
    setAccounts(prev => [...prev, account])
  }

  const handleRemoveAccount = (uuid) => {
    setAccounts(prev => prev.filter(a => a.auth.uuid != uuid))
  }

  const handleAddPosts = (page, posts, hasNext) => {
    setPosts(prev => ({
      page: page,
      list: [...prev.list, ...posts],
      hasNext: hasNext
    }))
    setPostsLock(false)
    setPostsInitialized(true)
  }

  const handleReceivePostsFailed = () => {
    setPosts(prev => ({
      ...prev,
      hasNext: false,
      lock: false,
      initialized: true
    }))
  }

  useEffect(() => {
    ipcRenderer.send('fetch-initial-data')
    ipcRenderer.send("fetch-preferences")

    ipcRenderer.on('initialized', (e, data) => {
      console.log('Renderer.receive: initialized', data)
      setAccounts(data)
      setInitializedStatus(true)
    })
  
    ipcRenderer.on("receive-account", (e, data) => {
      console.log('Renderer.receive: receive-account', data)
      handleAddAccount(data)
    })

    ipcRenderer.on("receive-categories", (e, data) => {
      console.log('Renderer.receive: receive-categories', data)
      setCurrentBlogCategories(data)
    })

    ipcRenderer.on("complete-disconnect-auth", (e, data) => {
      console.log('Renderer.receive: complete-disconnect-auth', data)
      handleRemoveAccount(data)
    })

    ipcRenderer.on("receive-posts-failed", (e, res) => {
      console.log('Renderer.receive: receive-posts-failed')
      handleReceivePostsFailed()
    })
    ipcRenderer.on("receive-posts", (e, res) => {
      console.log('Renderer.receive: receive-posts', res)
      handleAddPosts(res.page, res.posts, res.hasNext)
    })
  
    ipcRenderer.on("receive-content", (e, post) => {
      console.log('Renderer.receive: receive-content', post)
      setCurrentPost({
        ...post,
        fetched: true
      })
    })

    ipcRenderer.on("receive-preferences", (e, data) => {
      console.log('Renderer.receive: receive-preferences', data)
      setPreferences(data)
    })
  }, [])

  return <></>
}
