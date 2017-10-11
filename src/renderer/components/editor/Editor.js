import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import autobind from 'autobind-decorator'
import dateformat from 'dateformat'
import classnames from 'classnames'
import Dropzone from 'react-dropzone'
import { ipcRenderer } from 'electron'
import TextField from 'material-ui/TextField'
import Dialog from 'material-ui/Dialog'
import Popover, { PopoverAnimationVertical } from 'material-ui/Popover'
import Menu from 'material-ui/Menu'
import MenuItem from 'material-ui/MenuItem'
import FloatingActionButton from 'material-ui/FloatingActionButton'
import ActionSwapVert from 'material-ui/svg-icons/action/swap-vert'

import { addPost, updatePost } from '../../actions'
import * as ContentMode from '../../constants/ContentMode'
import * as EditorMode from '../../constants/EditorMode'

import MarkdownEditor from './MarkdownEditor'
import QuillEditor from './QuillEditor'
import TinymceEditor from './TinymceEditor'
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
			editorMode: props.preferences.editor || EditorMode.MARKDOWN,
			showInfoBox: false,
			showLoading: false,
			showPreview: false,
			showEditorMode: false,
			popoverParent: null,
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
				categoryId: "",
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
	}

	componentWillUnmount() {
		document.body.removeEventListener("keydown", this.handleKeyDown, false)

		ipcRenderer.removeListener("start-add-file", this.handleStartAddFile)
		ipcRenderer.removeListener("finish-add-file", this.handleFinishAddFile)
		ipcRenderer.removeListener("finish-add-content", this.handleFinishSaveContent)
		ipcRenderer.removeListener("finish-save-content", this.handleFinishSaveContent)
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
	handleChangeCategory(e, index, value) {
		this.setState({
			categoryId: value
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
		const { title, categoryId, tags, editorMode } = this.state
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
		// TODO
		const { uploadFileCount, uploadFinishedFileCount } = this.state
		this.setState({
			uploadFileCount: uploadFileCount + 1
		})
	}

	@autobind
	handleFinishAddFile(e) {
		// TODO
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
	handleOpenEditorMode(e) {
		e.preventDefault()
		this.setState({
			showEditorMode: true,
			popoverParent: e.currentTarget
		})
	}

	@autobind
	handleCloseEditorMode(e) {
		this.setState({
			showEditorMode: false
		})
	}

	handleChangeEditorMode(selectedMode) {
		const { editor } = this.refs

		this.setState({
			content: editor.getContent(),
			editorMode: selectedMode,
			showEditorMode: false
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
	handleDropFile(files) {
		const { currentBlog } = this.props
		files.map(file => {
			ipcRenderer.send("add-file", currentBlog.name, file.path)
		})
	}

	@autobind
	handlePreview() {
		const { editor } = this.refs
		this.setState({
			content: editor.getContent(),
			showPreview: true
		})
	}

	@autobind
	handleClosePreview() {
		this.setState({
			showPreview: false
		})
	}

	getEditor() {
		const { currentBlog } = this.props
		const { content, editorMode } = this.state

		if (editorMode == EditorMode.QUILL) {
			return <QuillEditor ref="editor" value={content} currentBlog={currentBlog} onImageHandler={this.handleDropFile} />
		} else if (editorMode == EditorMode.TINYMCE) {
			return <TinymceEditor ref="editor" value={content} currentBlog={currentBlog} onImageHandler={this.handleDropFile} />
		} else {
			return <MarkdownEditor ref="editor" value={content} currentBlog={currentBlog} />
		}
	}

	render() {
		const { onFinish, categories, post } = this.props
		const { title, content, categoryId, tags, showInfoBox, showLoading, showPreview, showEditorMode, popoverParent, editorMode, uploadFileCount, uploadFinishedFileCount } = this.state

		let uploadMessage = "파일을 넣어주세요."
		let uploading = false
		if (uploadFileCount > 0) {
			uploading = true
			uploadMessage = `업로드 중 (${uploadFinishedFileCount} / ${uploadFileCount})`
		}

		return (
			<div className="editor_wrap">
				<EditorToolbar title={title}
					onTitleChange={this.handleChangeTitle}
					onPreviewClick={this.handlePreview}
					onSaveClick={this.handlePublishDialogOpen}
					onCancelClick={this.handleCancel} />

				<div className="editor">
					<Dropzone disableClick={true} accept="image/*" className={classnames({droppable: uploading})} activeClassName="droppable" style={{width: "100%",height:"100%"}}
						onDrop={this.handleDropFile}>

						{this.getEditor()}

						<div className="dropzone_box">
							<b>{uploadMessage}</b>
						</div>

					</Dropzone>
				</div>

				<Dialog title={title} actions={[]} modal={false} open={showPreview} autoScrollBodyContent={true}
					onRequestClose={this.handleClosePreview}>
					<div className="content preview_content" dangerouslySetInnerHTML={{__html: content}} />
				</Dialog>

				<EditorInfoDialog open={showInfoBox} category={categoryId} categories={categories} tags={tags}
					onTagsChange={this.handleChangeTags}
					onCategoryChange={this.handleChangeCategory}
					onRequestClose={this.handlePublishDialogClose}
					onRequestSave={this.handleSave}
					onRequestPublish={this.handlePublish} />

				<FloatingActionButton className="btn_change_editor" mini={true} onClick={this.handleOpenEditorMode}>
					<ActionSwapVert />
				</FloatingActionButton>

				<Popover open={this.state.showEditorMode}
					anchorEl={this.state.popoverParent}
					anchorOrigin={{horizontal: 'right', vertical: 'top'}}
					targetOrigin={{horizontal: 'right', vertical: 'bottom'}}
					onRequestClose={this.handleCloseEditorMode}>
					<Menu>
						<MenuItem primaryText="Rich Editor (Quill)" checked={editorMode === EditorMode.QUILL}
							onTouchTap={e => this.handleChangeEditorMode(EditorMode.QUILL)} />
						<MenuItem primaryText="Rich Editor (Tinymce)" checked={editorMode === EditorMode.TINYMCE}
							onTouchTap={e => this.handleChangeEditorMode(EditorMode.TINYMCE)} />
						<MenuItem primaryText="Markdown Editor" checked={editorMode === EditorMode.MARKDOWN}
							onTouchTap={e => this.handleChangeEditorMode(EditorMode.MARKDOWN)} />
					</Menu>
				</Popover>

				{showLoading && <Loading />}

			</div>
		)
	}
}

Editor.propTypes = {
	currentBlog: PropTypes.object.isRequired,
	post: PropTypes.object,
	categories: PropTypes.array.isRequired,
	mode: PropTypes.string.isRequired,
	onFinish: PropTypes.func.isRequired
}

export default Editor
