import React, { useEffect, useState, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import dateformat from 'dateformat'
import update from 'immutability-helper'
import { ipcRenderer, remote } from 'electron'

import { addPost, updatePost } from '../../actions'
import * as ContentMode from '../../constants/ContentMode'

import { Snackbar } from '@material-ui/core'
import EditorContent from './EditorContent'
import EditorToolbar from './EditorToolbar'
import EditorInfoDialog from './EditorInfoDialog'
import Loading from '../Loading'

import { pageview } from '../../modules/AnalyticsHelper'


export default function Editor({mode, onFinish}) {
  const currentBlog = useSelector(state => state.currentBlog)
  const post = useSelector(state => state.currentPost)
  const categories = useSelector(state => state.categories)
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
				visibility: post.visibility,
				tags: post.tags && post.tags.tag? post.tags.tag: []
			}
		} else {
			return {
				title: "",
				content: "",
				categoryId: '0',
				visibility: 0,
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

	function handleChangeTags(tags) {
    setPostData(update(postData, {
      tags: {
        $set: tags
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

	function handleSave() {
		requestSave("0")
	}

	function handlePublish() {
		requestSave("20")
	}

	function requestSave(visibility) {
		let savePost = {
			title: postData.title,
			visibility: visibility,
			content: postData.content,
			categoryId: postData.categoryId,
			tags: {
				tag: postData.tags.join(",")
			}
		}

    setShowLoading(true)
    setPostData(update(postData, {
			visibility: {
        $set: visibility
      },
    }))

		if (mode == ContentMode.EDIT) {
			savePost = Object.assign({}, post, savePost)
			ipcRenderer.send("save-content", currentBlog.name, savePost)
		} else {
			ipcRenderer.send("add-content", currentBlog.name, savePost)
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

	function handleFinishSaveContent(e, postId, url) {
		const { title, visibility, content, categoryId, tags } = postData
    setShowLoading(false)

		if (!postId) {
			return
		}

		let savedPost = {
			id: postId,
			title: title,
			visibility: visibility,
			content: content,
			categoryId: categoryId,
			tags: {
				tag: tags
			},
			postUrl: url,
			date: dateformat(new Date(), 'yyyy-mm-dd HH:MM:ss'),
		}

		mode == ContentMode.EDIT ? onUpdate(Object.assign(savedPost, {date: post.date})) : onAdd(savedPost)
		onFinish()
	}

	function handleCancel() {
		if (confirm("저장하지 않은 내용은 사라집니다. 계속하시겠습니까?")) {
			onFinish()
		}
	}

  function onUpdate(post) {
    dispatch(updatePost(post))
  }
  function onAdd(post) {
    dispatch(addPost(post))
  }


	function handleChangeContent(content) {
    setPostData(update(postData, {
      content: {
        $set: content
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
		files.map(file => {
      const fileReader = new FileReader();
      fileReader.addEventListener("load", e => {
        ipcRenderer.send("add-file", currentBlog.name, e.target.result, {
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

    remote.app.showExitPrompt = true

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

      remote.app.showExitPrompt = false
    }
  })

  return (
    <div className="editor_wrap">
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

      <EditorInfoDialog open={showInfoBox} category={postData.categoryId} categories={categories} tags={postData.tags}
        onTagsChange={handleChangeTags}
        onCategoryChange={handleChangeCategory}
        onRequestClose={e => setShowInfoBox(false)}
        onRequestSave={handleSave}
        onRequestPublish={handlePublish}
      />

      {showLoading && <Loading />}
      
      <Snackbar
        open={uploadFileCount > 0}
        message={`업로드 중 (${uploadFinishedFileCount} / ${uploadFileCount})`}
      />

    </div>
  )
}
