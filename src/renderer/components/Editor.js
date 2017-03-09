import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

import dateformat from 'dateformat'
import classnames from 'classnames'
import Dropzone from 'react-dropzone'
import { ipcRenderer } from 'electron'
import TextField from 'material-ui/TextField'
import Dialog from 'material-ui/Dialog'
import FloatingActionButton from 'material-ui/FloatingActionButton'
import ActionSwapVert from 'material-ui/svg-icons/action/swap-vert'

import { addPost, updatePost } from '../actions'
import * as ContentMode from '../constants/ContentMode'
import * as EditorMode from '../constants/EditorMode'

import MarkdownEditor from './MarkdownEditor'
import RichEditor from './RichEditor'
import EditorToolbar from './EditorToolbar'
import EditorInfoDialog from './EditorInfoDialog'
import Loading from './Loading'

class Editor extends Component {
	constructor(props, context) {
		super(props, context)

		this.state = Object.assign({
			editorMode: EditorMode.MARKDOWN,
			showInfoBox: false,
			showLoading: false,
			showPreview: false,
		}, this.makePostState(props))

		this.handleKeyDown = this.handleKeyDown.bind(this)
		this.handleFinishSaveContent = this.handleFinishSaveContent.bind(this)
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

	componentWillMount() {
		document.body.addEventListener("keydown", this.handleKeyDown, false)

		ipcRenderer.on("finish-add-content", this.handleFinishSaveContent)
		ipcRenderer.on("finish-save-content", this.handleFinishSaveContent)
	}

	componentWillUnmount() {
		document.body.removeEventListener("keydown", this.handleKeyDown, false)

		ipcRenderer.removeListener("finish-add-content", this.handleFinishSaveContent)
		ipcRenderer.removeListener("finish-save-content", this.handleFinishSaveContent)
	}

	handlePublishDialogClose() {
		this.setState({
			showInfoBox: false
		})
	}

	handlePublishDialogOpen() {
		this.setState({
			showInfoBox: true
		})
	}

	handleChangeTitle(e) {
		this.setState({
			title: e.target.value
		})
	}

	handleChangeTags(tags) {
		this.setState({
			tags: tags
		})
	}

	handleChangeCategory(e, index, value) {
		this.setState({
			categoryId: value
		})
	}

	handleSave() {
		this.requestSave("0")
	}

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

	handleFinishSaveContent(e, postId) {
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
			date: dateformat(new Date(), 'yyyy-mm-dd HH:MM:ss'),
		}

		mode == ContentMode.EDIT ? onUpdate(Object.assign(savedPost, {date: post.date})) : onAdd(savedPost)
		onFinish()
	}

	handleCancel() {
		const { onFinish } = this.props

		if (confirm("저장하지 않은 내용은 사라집니다. 계속하시겠습니까?")) {
			onFinish()
		}
	}

	handleChangeEditorMode() {
		const { editor } = this.refs
		const { editorMode } = this.state
		let nextEditorMode = editorMode == EditorMode.RICH ? EditorMode.MARKDOWN : EditorMode.RICH

		this.setState({
			content: editor.getContent(),
			editorMode: nextEditorMode
		})
	}

	handleKeyDown(e) {
		if (e.metaKey || e.altKey) {
			if (e.keyCode == 83) {
				e.preventDefault()
				this.handlePublishDialogOpen()
			}
		}
	}

	handleDropFile(files) {
		const { currentBlog } = this.props
		files.map(file => {
			ipcRenderer.send("add-file", currentBlog.name, file.path)
		})
	}

	handlePreview() {
		const { editor } = this.refs
		this.setState({
			content: editor.getContent(),
			showPreview: true
		})
	}

	handleClosePreview() {
		this.setState({
			showPreview: false
		})
	}

	getEditor() {
		const { currentBlog } = this.props
		const { content, editorMode } = this.state

		if (editorMode == EditorMode.RICH) {
			return <RichEditor ref="editor" value={content} onImageHandler={this.handleDropFile.bind(this)} />
		} else {
			return <MarkdownEditor ref="editor" value={content} currentBlog={currentBlog} />
		}
	}

	render() {
		const { onFinish, categories, post } = this.props
		const { title, content, categoryId, tags, showInfoBox, showLoading, showPreview } = this.state

		return (
			<div className="editor_wrap">
				<div className="editor">
					<Dropzone disableClick={true} accept="image/*" style={{width: "100%",height:"100%"}}
						onDrop={this.handleDropFile.bind(this)}>

						<EditorToolbar title={title}
							onTitleChange={this.handleChangeTitle.bind(this)}
							onPreviewClick={this.handlePreview.bind(this)}
							onSaveClick={this.handlePublishDialogOpen.bind(this)}
							onCancelClick={this.handleCancel.bind(this)} />

						{this.getEditor()}

					</Dropzone>
				</div>

				<Dialog title={title} actions={[]} modal={false} open={showPreview} autoScrollBodyContent={true}
					onRequestClose={this.handleClosePreview.bind(this)}>
					<div className="content preview_content" dangerouslySetInnerHTML={{__html: content}} />
				</Dialog>

				<EditorInfoDialog open={showInfoBox} category={categoryId} categories={categories} tags={tags}
					onTagsChange={this.handleChangeTags.bind(this)}
					onCategoryChange={this.handleChangeCategory.bind(this)}
					onRequestClose={this.handlePublishDialogClose.bind(this)}
					onRequestSave={this.handleSave.bind(this)}
					onRequestPublish={this.handlePublish.bind(this)} />

				<FloatingActionButton className="btn_change_editor" mini={true} onClick={this.handleChangeEditorMode.bind(this)}>
					<ActionSwapVert />
				</FloatingActionButton>

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

const mapStateToProps = (state) => {
  return {
		currentBlog: state.currentBlog,
		post: state.currentPost,
		categories: state.categories
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    onUpdate: (post) => {
			dispatch(updatePost(post))
		},

		onAdd: (post) => {
			dispatch(addPost(post))
		}
  }
}

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(Editor)
