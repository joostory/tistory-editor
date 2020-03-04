import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import update from 'immutability-helper'
import { ipcRenderer } from 'electron'

import { addPost, updatePost } from '../../actions'
import * as ContentMode from '../../constants/ContentMode'

import {
  Box, Snackbar, makeStyles
} from '@material-ui/core'
import EditorContent from './EditorContent'
import EditorToolbar from './EditorToolbar'
import EditorInfoDialog from './EditorInfoDialog'
import Loading from '../Loading'

import { pageview } from '../../modules/AnalyticsHelper'
import { isPublished, DRAFT, PUBLISHED } from '../../constants/PostState'

const useStyles = makeStyles(theme => ({
  root: {
    paddingTop: theme.spacing(8),
    paddingBottom: theme.spacing(8)
  }
}))

export default function Editor({mode, onFinish}) {
  const classes = useStyles()
  const currentAuth = useSelector(state => state.currentAuth)
  const currentBlog = useSelector(state => state.currentBlog)
  const post = useSelector(state => state.currentPost)
  const dispatch = useDispatch()

  const [showInfoBox, setShowInfoBox] = useState(false)
  const [showLoading, setShowLoading] = useState(false)
  const [uploadFileCount, setUploadFileCount] = useState(0)
  const [uploadFinishedFileCount, setUploadFinishedFileCount] = useState(0)

  const [postData, setPostData] = useState(makePostState())

  function makePostState() {
		if (mode == ContentMode.EDIT && post) {
			return {
				title: post.title,
        content: post.content,
        categoryId: post.categoryId,
				tags: post.tags
			}
		} else {
			return {
				title: "",
        content: "",
        categoryId: '0',
				tags: []
			}
		}
	}

	function handleChangeTitle(e) {
    setPostData(update(postData, {
      title: {
        $set: e.target.value.replace(/\n/g, '')
      }
    }))
  }
  
  function handleChangeCategory(e) {
    setPostData(update(postData, {
      categoryId: {
        $set: e.target.value
      }
    }))
  }

	function handleChangeTags(tags) {
    setPostData(update(postData, {
      tags: {
        $set: tags
      }
    }))
	}

	function handlePublish(state) {
		let savePost = {
			title: postData.title,
      content: postData.content,
      categoryId: postData.categoryId,
      tags: postData.tags.join(","),
      state: state,
      visibility: isPublished(state)? '20' : '0'
    }

    setShowLoading(true)
    setShowInfoBox(false)
		if (mode == ContentMode.EDIT) {
			savePost.id = post.id
			ipcRenderer.send("save-content", currentAuth.uuid, currentBlog.name, savePost)
		} else {
			ipcRenderer.send("add-content", currentAuth.uuid, currentBlog.name, savePost)
		}
  }

	function handleStartAddFile(e) {
    setUploadFileCount(uploadFileCount + 1)
	}

	function handleFinishAddFile(e) {
		if (uploadFileCount == uploadFinishedFileCount + 1) {
      setUploadFileCount(0)
      setUploadFinishedFileCount(0)
		} else {
      setUploadFinishedFileCount(uploadFinishedFileCount + 1)
		}
	}

	function handleFinishSaveContent(e, post) {
    setShowLoading(false)

		if (!post) {
			return
    }
    
    if (mode == ContentMode.ADD) {
      dispatch(addPost(post))
    } else {
      dispatch(updatePost(post))
    }
		onFinish()
	}

	function handleCancel() {
		if (confirm("저장하지 않은 내용은 사라집니다. 계속하시겠습니까?")) {
			onFinish()
		}
	}

	function handleChangeContent(value) {
    setPostData(update(postData, {
      content: {
        $set: value
      }
    }))
	}

	function handleKeyDown(e) {
		let isMac = navigator.platform.indexOf("Mac") === 0
		let commandKey = isMac? e.metaKey : e.ctrlKey

		if (commandKey) {
			if (e.keyCode == 83) {
        e.preventDefault()
        setShowInfoBox(true)
			}
		}
	}

  function handleUploadFiles(files) {
    if (currentAuth.provider != 'tistory') {
      return
    }

		files.map(file => {
      const fileReader = new FileReader();
      fileReader.addEventListener("load", e => {
        ipcRenderer.send("add-file", currentAuth.uuid, currentBlog.name, e.target.result, {
          name: file.name,
          type: file.type,
          size: file.size
        })
      });
      fileReader.readAsDataURL(file);
		})
  }
  
  useEffect(() => {
    document.body.addEventListener("keydown", handleKeyDown, false)

		ipcRenderer.on("start-add-file", handleStartAddFile)
		ipcRenderer.on("finish-add-file", handleFinishAddFile)
		ipcRenderer.on("finish-add-content", handleFinishSaveContent)
    ipcRenderer.on("finish-save-content", handleFinishSaveContent)

    ipcRenderer.send("enable-exist-prompt")

    if (post) {
			pageview(`/blog/${currentBlog.blogId}/post/${post.id}/edit`, `${post.title}`)
		} else {
			pageview(`/blog/${currentBlog.blogId}/post`, '새 글 작성')
		}
    
    return () => {
      document.body.removeEventListener("keydown", handleKeyDown, false)

      ipcRenderer.removeListener("start-add-file", handleStartAddFile)
      ipcRenderer.removeListener("finish-add-file", handleFinishAddFile)
      ipcRenderer.removeListener("finish-add-content", handleFinishSaveContent)
      ipcRenderer.removeListener("finish-save-content", handleFinishSaveContent)

      ipcRenderer.send("disable-exist-prompt")
    }
  })

  return (
    <Box className={classes.root}>
      <EditorToolbar title={postData.title}
        onSaveClick={e => setShowInfoBox(true)}
        onCancelClick={handleCancel}
      />

      <EditorContent
        content={postData.content}
        onUpload={handleUploadFiles}
        onChange={handleChangeContent}
        title={postData.title}
        onTitleChange={handleChangeTitle}
      />

      <EditorInfoDialog open={showInfoBox} categoryId={postData.categoryId} tags={postData.tags}
        onCategoryChange={handleChangeCategory}
        onTagsChange={handleChangeTags}
        onRequestClose={e => setShowInfoBox(false)}
        onRequestDraft={e => handlePublish(DRAFT)}
        onRequestPublish={e => handlePublish(PUBLISHED)}
      />

      {showLoading && <Loading />}
      
      <Snackbar
        open={uploadFileCount > 0}
        message={`업로드 중 (${uploadFinishedFileCount} / ${uploadFileCount})`}
      />

    </Box>
  )
}
