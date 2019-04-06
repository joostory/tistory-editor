import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import autobind from 'autobind-decorator'
import dateformat from 'dateformat'
import { ipcRenderer, remote } from 'electron'

import { addPost, updatePost } from '../../actions'
import * as ContentMode from '../../constants/ContentMode'

import { Snackbar } from '@material-ui/core'
import EditorContent from './EditorContent'
import EditorToolbar from './EditorToolbar'
import EditorInfoDialog from './EditorInfoDialog'
import Loading from '../Loading'

import { pageview } from '../../modules/AnalyticsHelper'

@connect(state => ({
	currentBlog: state.currentBlog,
	post: state.currentPost,
	categories: state.categories,
	preferences: state.preferences
}), dispatch => ({
	onUpdate: (post) => {
		dispatch(updatePost(post))
	},
	onAdd: (post) => {
		dispatch(addPost(post))
	}
}))
class Editor extends Component {
	constructor(props, context) {
		super(props, context)

		this.state = Object.assign({
			showInfoBox: false,
			showLoading: false,
			uploadFileCount: 0,
			uploadFinishedFileCount: 0
		}, this.makePostState(props))
	}

	makePostState(props) {
		if (props.mode == ContentMode.EDIT && props.post) {
			return {
				title: props.post.title,
				content: props.post.content,
				categoryId: props.post.categoryId,
				visibility: props.post.visibility,
				tags: props.post.tags && props.post.tags.tag? props.post.tags.tag: []
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

	componentDidMount() {
		const { currentBlog, post } = this.props
		if (post) {
			pageview(`/blog/${currentBlog.blogId}/post/${post.id}/edit`, `${post.title}`)
		} else {
			pageview(`/blog/${currentBlog.blogId}/post`, '새 글 작성')
		}
	}

	componentWillMount() {
		document.body.addEventListener("keydown", this.handleKeyDown, false)

		ipcRenderer.on("start-add-file", this.handleStartAddFile)
		ipcRenderer.on("finish-add-file", this.handleFinishAddFile)
		ipcRenderer.on("finish-add-content", this.handleFinishSaveContent)
		ipcRenderer.on("finish-save-content", this.handleFinishSaveContent)

		remote.app.showExitPrompt = true
	}

	componentWillUnmount() {
		document.body.removeEventListener("keydown", this.handleKeyDown, false)

		ipcRenderer.removeListener("start-add-file", this.handleStartAddFile)
		ipcRenderer.removeListener("finish-add-file", this.handleFinishAddFile)
		ipcRenderer.removeListener("finish-add-content", this.handleFinishSaveContent)
		ipcRenderer.removeListener("finish-save-content", this.handleFinishSaveContent)

		remote.app.showExitPrompt = false
	}

	@autobind
	handlePublishDialogClose() {
		this.setState({
			showInfoBox: false
		})
	}

	@autobind
	handlePublishDialogOpen() {
		this.setState({
			showInfoBox: true
		})
	}

	@autobind
	handleChangeTitle(e) {
		this.setState({
			title: e.target.value
		})
	}

	@autobind
	handleChangeTags(tags) {
		this.setState({
			tags: tags
		})
	}

	@autobind
	handleChangeCategory(e) {
		this.setState({
			categoryId: e.target.value
		})
	}

	@autobind
	handleSave() {
		this.requestSave("0")
	}

	@autobind
	handlePublish() {
		this.requestSave("3")
	}

	requestSave(visibility) {
		const { post, currentBlog, mode } = this.props
		const { title, categoryId, tags } = this.state
		const { editor } = this.refs

		let content = editor.getContent()
		let savePost = {
			title: title,
			visibility: visibility,
			content: content,
			categoryId: categoryId,
			tags: {
				tag: tags.join(",")
			}
		}

		this.setState({
			content: content,
			visibility: visibility,
			showLoading: true
		})

		if (mode == ContentMode.EDIT) {
			savePost = Object.assign({}, post, savePost)
			ipcRenderer.send("save-content", currentBlog.name, savePost)
		} else {
			ipcRenderer.send("add-content", currentBlog.name, savePost)
		}
	}

	@autobind
	handleStartAddFile(e) {
		const { uploadFileCount, uploadFinishedFileCount } = this.state
		this.setState({
			uploadFileCount: uploadFileCount + 1
		})
	}

	@autobind
	handleFinishAddFile(e) {
		const { uploadFileCount, uploadFinishedFileCount } = this.state
		if (uploadFileCount == uploadFinishedFileCount + 1) {
			this.setState({
				uploadFileCount: 0,
				uploadFinishedFileCount: 0
			})
		} else {
			this.setState({
				uploadFinishedFileCount: uploadFinishedFileCount + 1
			})
		}
		
	}

	@autobind
	handleFinishSaveContent(e, postId, url) {
		const { onFinish, post, mode, onUpdate, onAdd } = this.props
		const { title, visibility, content, categoryId, tags } = this.state

		this.setState({
			showLoading: false
		})

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

	@autobind
	handleCancel() {
		const { onFinish } = this.props

		if (confirm("저장하지 않은 내용은 사라집니다. 계속하시겠습니까?")) {
			onFinish()
		}
	}

	@autobind
	handleChangeContent(content) {
		this.setState({
			content: content
		})
	}

	@autobind
	handleKeyDown(e) {
		let isMac = navigator.platform.indexOf("Mac") === 0
		let commandKey = isMac? e.metaKey : e.ctrlKey

		if (commandKey) {
			if (e.keyCode == 83) {
				e.preventDefault()
				this.handlePublishDialogOpen()
			}
		}
	}

	@autobind
	handleUploadFiles(files) {
    const { currentBlog } = this.props
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

	render() {
		const { onFinish, currentBlog, categories, post } = this.props
		const { title, content, categoryId, tags, showInfoBox, showLoading, uploadFileCount, uploadFinishedFileCount } = this.state

		return (
			<div className="editor_wrap">
				<EditorToolbar title={title}
					onTitleChange={this.handleChangeTitle}
					onSaveClick={this.handlePublishDialogOpen}
					onCancelClick={this.handleCancel} />

				<EditorContent ref="editor"
					currentBlog={currentBlog}
					content={content}
					onUpload={this.handleUploadFiles}
					onChange={this.handleChangeContent} />

				<EditorInfoDialog open={showInfoBox} category={categoryId} categories={categories} tags={tags}
					onTagsChange={this.handleChangeTags}
					onCategoryChange={this.handleChangeCategory}
					onRequestClose={this.handlePublishDialogClose}
					onRequestSave={this.handleSave}
					onRequestPublish={this.handlePublish} />

        {showLoading && <Loading />}
        
        <Snackbar
          open={uploadFileCount > 0}
          message={`업로드 중 (${uploadFinishedFileCount} / ${uploadFileCount})`}
        />

			</div>
		)
	}
}

Editor.propTypes = {
	currentBlog: PropTypes.object,
	post: PropTypes.object,
	categories: PropTypes.array,
	mode: PropTypes.string.isRequired,
	onFinish: PropTypes.func.isRequired
}

export default Editor
