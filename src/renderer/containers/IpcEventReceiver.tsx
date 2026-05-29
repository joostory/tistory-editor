import React, { useEffect } from 'react'
import { ipcRenderer } from 'electron'
import { useSetAtom } from 'jotai'
import { preferencesState } from '#/renderer/state/preferences'
import { initializedStatusState } from '#/renderer/state/status'
import { accountsState } from '#/renderer/state/accounts'
import { currentBlogCategoriesState } from '#/renderer/state/currentBlog'
import { postsInitializedState, postsLockState, postsState } from '#/renderer/state/posts'
import { currentPostState } from '#/renderer/state/currentPost'
import { Account, Post, Preferences } from '#/renderer/types'

export default function IpcEventReceiver() {
  const setPreferences = useSetAtom(preferencesState)
  const setAccounts = useSetAtom(accountsState)
  const setInitializedStatus = useSetAtom(initializedStatusState)
  const setCurrentBlogCategories = useSetAtom(currentBlogCategoriesState)
  const setPosts = useSetAtom(postsState)
  const setPostsLock = useSetAtom(postsLockState)
  const setPostsInitialized = useSetAtom(postsInitializedState)
  const setCurrentPost = useSetAtom(currentPostState)

  const handleAddAccount = (account: Account) => {
    setAccounts(prev => [...prev, account])
  }

  const handleRemoveAccount = (uuid: string) => {
    setAccounts(prev => prev.filter(a => a.auth.uuid !== uuid))
  }

  const handleAddPosts = (page: number, posts: Post[], hasNext: boolean) => {
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
      hasNext: false
    }))
    setPostsLock(false)
    setPostsInitialized(true)
  }

  useEffect(() => {
    ipcRenderer.send('fetch-initial-data')
    ipcRenderer.send("fetch-preferences")

    ipcRenderer.on('initialized', (_e, data: Account[]) => {
      console.log('Renderer.receive: initialized', data)
      setAccounts(data)
      setInitializedStatus(true)
    })
  
    ipcRenderer.on("receive-account", (_e, data: Account) => {
      console.log('Renderer.receive: receive-account', data)
      handleAddAccount(data)
    })

    ipcRenderer.on("receive-categories", (_e, data: any[]) => {
      console.log('Renderer.receive: receive-categories', data)
      setCurrentBlogCategories(data)
    })

    ipcRenderer.on("complete-disconnect-auth", (_e, data: string) => {
      console.log('Renderer.receive: complete-disconnect-auth', data)
      handleRemoveAccount(data)
    })

    ipcRenderer.on("receive-posts-failed", () => {
      console.log('Renderer.receive: receive-posts-failed')
      handleReceivePostsFailed()
    })
    
    ipcRenderer.on("receive-posts", (_e, res: { page: number; posts: Post[]; hasNext: boolean }) => {
      console.log('Renderer.receive: receive-posts', res)
      handleAddPosts(res.page, res.posts, res.hasNext)
    })
  
    ipcRenderer.on("receive-content", (_e, post: Post) => {
      console.log('Renderer.receive: receive-content', post)
      setCurrentPost({
        ...post,
        fetched: true
      } as any)
    })

    ipcRenderer.on("receive-preferences", (_e, data: Preferences) => {
      console.log('Renderer.receive: receive-preferences', data)
      setPreferences(data)
    })
  }, [])

  return <></>
}
