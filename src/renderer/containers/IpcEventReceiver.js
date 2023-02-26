import React, { useEffect } from 'react'
import { ipcRenderer } from 'electron'
import { useSetRecoilState, useRecoilCallback } from 'recoil'
import { preferencesState } from '../state/preferences'
import { initializedStatusState } from '../state/status'
import { accountsState } from '../state/accounts'
import { currentBlogCategoriesState } from '../state/currentBlog'
import { postsInitializedState, postsLockState, postsState } from '../state/posts'
import { currentPostState } from '../state/currentPost'


export default function IpcEventReceiver() {
  const setPreferences = useSetRecoilState(preferencesState)
  const setAccounts = useSetRecoilState(accountsState)
  const setInitializedStatus = useSetRecoilState(initializedStatusState)
  const setCurrentBlogCategories = useSetRecoilState(currentBlogCategoriesState)
  const setPosts = useSetRecoilState(postsState)
  const setPostsLock = useSetRecoilState(postsLockState)
  const setPostsInitialized = useSetRecoilState(postsInitializedState)
  const setCurrentPost = useSetRecoilState(currentPostState)

  const handleAddAccount = useRecoilCallback(({snapshot}) => async (account) => {
    const accounts = await snapshot.getPromise(accountsState)
    setAccounts([...accounts, account])
  })

  const handleRemoveAccount = useRecoilCallback(({snapshot}) => async (uuid) => {
    const accounts = await snapshot.getPromise(accountsState)
    setAccounts(accounts.filter(a => a.auth.uuid != uuid))
  })

  const handleAddPosts = useRecoilCallback(({snapshot}) => async (page, posts, hasNext) => {
    const state = await snapshot.getPromise(postsState)
    setPosts({
      page: page,
      list: [...state.list, ...posts],
      hasNext: hasNext
    })
    setPostsLock(false)
    setPostsInitialized(true)
  })

  const handleReceivePostsFailed = useRecoilCallback(({snapshot}) => async () => {
    const state = await snapshot.getPromise(postsState)
    setPosts({
      ...state,
      hasNext: false,
      lock: false,
      initialized: true
    })
  })

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
