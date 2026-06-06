import React, { useEffect, useState } from 'react'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import update from 'immutability-helper'
import { ipcRenderer } from 'electron'

import { currentAuthState, currentBlogState } from '#/renderer/state/currentBlog'
import * as ContentMode from '#/renderer/constants/ContentMode'

import {
  Box
} from '@mui/material'
import EditorContent from '#/renderer/components/editor/EditorContent'
import EditorToolbar from '#/renderer/components/editor/EditorToolbar'
import EditorInfoDialog from '#/renderer/components/editor/EditorInfoDialog'
import Loading from '#/renderer/components/Loading'

import { pageview } from '#/renderer/modules/AnalyticsHelper'
import { isPublished, PUBLISHED } from '#/renderer/constants/PostState'
import { currentPostState } from '#/renderer/state/currentPost'
import { postsState } from '#/renderer/state/posts'
import { Post, PostData, Auth, Blog } from '#/renderer/types'

const styles = {
  root: {
    paddingTop: (theme: any) => theme.spacing(12),
    paddingBottom: (theme: any) => theme.spacing(12)
  }
}

interface EditorProps {
  mode: string;
  onFinish: () => void;
}

export default function Editor({ mode, onFinish }: EditorProps) {
  const currentAuth = useAtomValue(currentAuthState) as Auth
  const currentBlog = useAtomValue(currentBlogState) as Blog
  const [post, setPost] = useAtom(currentPostState) as [Post | null, any]
  const setPosts = useSetAtom(postsState)

  const [showInfoBox, setShowInfoBox] = useState<boolean>(false)
  const [showLoading, setShowLoading] = useState<boolean>(false)

  const [postData, setPostData] = useState<PostData>(makePostState())

  const handleAddPost = (postItem: Post) => {
    setPosts((prev: any) => ({
      ...prev,
      list: [postItem, ...prev.list]
    }))
  }

  const handleModifyPost = (postItem: Post) => {
    setPosts((prev: any) => {
      const modifiedList = [...prev.list]
      const index = modifiedList.findIndex((p: any) => p.id == postItem.id)
      modifiedList.splice(index, 1, postItem)
      return {
        ...prev,
        list: modifiedList
      }
    })
    setPost(postItem)
  }

  function makePostState(): PostData {
    if (mode === ContentMode.EDIT && post) {
      const content = post.contentJson || post.content
      return {
        title: post.title,
        content: content,
        tags: post.tags
      }
    } else {
      return {
        title: "",
        content: "",
        tags: []
      }
    }
  }

  function handleChangeTitle(e: React.ChangeEvent<HTMLInputElement>) {
    setPostData(update(postData, {
      title: {
        $set: e.target.value.replace(/\n/g, '')
      }
    }))
  }
  
  function handleChangeTags(tags: string[]) {
    setPostData(update(postData, {
      tags: {
        $set: tags
      }
    }))
  }

  function handlePublish(state: string) {
    const savePost: any = {
      title: postData.title,
      content: postData.content,
      format: 'json',
      tags: postData.tags,
      state: state,
      visibility: isPublished(state) ? '20' : '0'
    }

    setShowLoading(true)
    setShowInfoBox(false)
    if (mode === ContentMode.EDIT && post) {
      savePost.id = post.id
      ipcRenderer.send("save-content", currentAuth.uuid, currentBlog.name, savePost)
    } else {
      ipcRenderer.send("add-content", currentAuth.uuid, currentBlog.name, savePost)
    }
  }

  function handleFinishSaveContent(e: any, postItem: Post) {
    setShowLoading(false)

    if (!postItem) {
      return
    }
    
    if (mode === ContentMode.ADD) {
      handleAddPost(postItem)
    } else {
      handleModifyPost(postItem)
    }
    onFinish()
  }

  function handleCancel() {
    if (confirm("저장하지 않은 내용은 사라집니다. 계속하시겠습니까?")) {
      onFinish()
    }
  }

  function handleChangeContent(value: any) {
    setPostData(update(postData, {
      content: {
        $set: value
      }
    }))
  }

  function handleKeyDown(e: KeyboardEvent) {
    const isMac = navigator.platform.indexOf("Mac") === 0
    const commandKey = isMac ? e.metaKey : e.ctrlKey

    if (commandKey) {
      if (e.keyCode === 83) {
        e.preventDefault()
        setShowInfoBox(true)
      }
    }
  }

  useEffect(() => {
    document.body.addEventListener("keydown", handleKeyDown, false)

    ipcRenderer.on("finish-add-content", handleFinishSaveContent)
    ipcRenderer.on("finish-save-content", handleFinishSaveContent)

    ipcRenderer.send("enable-exist-prompt")

    if (post) {
      pageview(`/blog/${currentBlog.name}/post/${post.id}/edit`, `${post.title}`)
    } else {
      pageview(`/blog/${currentBlog.name}/post`, '새 글 작성')
    }
    
    return () => {
      document.body.removeEventListener("keydown", handleKeyDown, false)

      ipcRenderer.removeListener("finish-add-content", handleFinishSaveContent)
      ipcRenderer.removeListener("finish-save-content", handleFinishSaveContent)

      ipcRenderer.send("disable-exist-prompt")
    }
  }, [])

  return (
    <Box sx={styles.root}>
      <EditorToolbar
        onSaveClick={() => setShowInfoBox(true)}
        onCancelClick={handleCancel}
        disabled={currentAuth.provider !== 'tumblr' && postData.title.length === 0}
      />

      <EditorContent
        content={postData.content}
        onChange={handleChangeContent}
        title={postData.title}
        onTitleChange={handleChangeTitle}
      />

      <EditorInfoDialog open={showInfoBox} tags={postData.tags}
        onTagsChange={handleChangeTags}
        onRequestClose={() => setShowInfoBox(false)}
        onRequestPublish={() => handlePublish(PUBLISHED)}
      />

      {showLoading && <Loading />}
      
    </Box>
  )
}
