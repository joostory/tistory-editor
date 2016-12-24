import React, { Component, PropTypes } from 'react'

import Codemirror from 'react-codemirror'
import 'codemirror/lib/codemirror.css'
import 'codemirror/addon/dialog/dialog.css'
import 'codemirror/mode/javascript/javascript'
import 'codemirror/mode/xml/xml'
import 'codemirror/mode/markdown/markdown'
import 'codemirror/addon/dialog/dialog'
import 'codemirror/addon/search/search'
import 'codemirror/addon/search/searchcursor'
import 'codemirror/addon/search/jump-to-line'
import toMarkdown from 'to-markdown'
import marked from 'marked'

import dateformat from 'dateformat'
import Dropzone from 'react-dropzone'
import { ipcRenderer } from 'electron'
import TextField from 'material-ui/TextField'

import EditorToolbar from './EditorToolbar'
import EditorInfoDialog from './EditorInfoDialog'

class Editor extends Component {
	constructor(props, context) {
		super(props, context)

		this.state = {
			post: props.post? props.post: {},
			title: props.post? props.post.title: "",
			content: props.post? toMarkdown(props.post.content): "",
			tags: props.post && props.post.tags && props.post.tags.tag? props.post.tags.tag.toString(): "",
			showInfoBox: false
		}
		this.handleKeyDown = this.handleKeyDown.bind(this)
		this.handleFinishSaveContent = this.handleFinishSaveContent.bind(this)
		this.handleFinishUploadFile = this.handleFinishUploadFile.bind(this)
	}

	componentWillMount() {
		document.body.addEventListener("keydown", this.handleKeyDown, false)

		ipcRenderer.on("finish-add-content", this.handleFinishSaveContent)
		ipcRenderer.on("finish-save-content", this.handleFinishSaveContent)
		ipcRenderer.on("finish-add-file", this.handleFinishUploadFile)
	}

	componentWillUnmount() {
		document.body.removeEventListener("keydown", this.handleKeyDown, false)

		ipcRenderer.removeListener("finish-add-content", this.handleFinishSaveContent)
		ipcRenderer.removeListener("finish-save-content", this.handleFinishSaveContent)
		ipcRenderer.removeListener("finish-add-file", this.handleFinishUploadFile)
	}

	componentWillReceiveProps(nextProps) {
		const { post } = this.state

		console.log(nextProps);

		if (post.id != nextProps.post.id) {
			this.setState({
				post: nextProps.post,
				title: nextProps.post.title,
				content: toMarkdown(nextProps.post.content),
				tags: nextProps.post.tags && nextProps.post.tags.tag? nextProps.post.tags.tag.toString(): ""
			})
		}
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
		console.log("change title", e.target.value)
		this.setState({
			title: e.target.value
		})
	}

	handleChangeContent(value) {
		this.setState({
			content: value
		})
	}

	handleChangeTags(e) {
		this.setState({
			tags: e.target.value
		})
	}

	handleChangeCategory(e, index, value) {
		console.log("change category", value)
		const { post } = this.state
		let newPost = Object.assign({}, post, {
			categoryId: value
		})
		this.setState({
			post: newPost
		})
	}

	handleSave() {
		this.requestSave("0")
	}

	handlePublish() {
		this.requestSave("3")
	}

	requestSave(visibility) {
		const { currentBlog, onSave } = this.props
		const { post, title, content, tags } = this.state

		let savePost = Object.assign({}, post, {
			title: title,
			visibility: visibility,
			content: marked(content),
			tags: {
				tag: tags
			}
		})

		this.setState({
			post: savePost
		})

		if (post.id) {
			ipcRenderer.send("save-content", currentBlog.name, savePost)
		} else {
			ipcRenderer.send("add-content", currentBlog.name, savePost)
		}
	}

	handleFinishSaveContent(e, postId) {
		const { onSave } = this.props
		const { post } = this.state

		if (!postId) {
			// handle Error
			alert("오류가 발생했습니다.")
			return
		}

		let savePost = Object.assign({}, post, {
			id: postId,
			date: post.id? post.date : dateformat(new Date(), 'yyyy-mm-dd HH:MM:ss'),
			tags: {
				tag: post.tags.tag.split(",")
			}
		})

		onSave(savePost)
	}

	handleFinishUploadFile(e, fileUrl) {
		const { editor } = this.refs
		console.log("finishUploadFile", fileUrl)
		let cm = editor.getCodeMirror()
		let CodeMirror = editor.getCodeMirrorInstance()
		cm.replaceRange("![](" + fileUrl + ")", CodeMirror.Pos(cm.getCursor().line))
	}

	handleKeyDown(e) {
		if (e.metaKey || e.altKey) {
			if (e.keyCode == 83) {
				e.preventDefault()
				this.handleSave()
			}
		}
	}

	handleDropFile(files) {
		const { currentBlog } = this.props
		files.map(file => {
			console.log(file.path)
			ipcRenderer.send("add-file", currentBlog.name, file.path)
		})
	}


	render() {
		const { onCancel, categories } = this.props
		const { post, title, content, tags, showInfoBox } = this.state

		let options = {
			lineNumbers: false,
			lineWrapping: true,
			mode: 'markdown',
			theme:'default'
    }

		return (
			<div className="content_wrap">
				<div className="editor">
					<Dropzone disableClick={true} accept="image/*" onDrop={this.handleDropFile.bind(this)} style={{width: "100%",height:"100%"}}>
						<EditorToolbar title={title}
							onTitleChange={this.handleChangeTitle.bind(this)}
							onSaveClick={this.handlePublishDialogOpen.bind(this)}
							onCancelClick={onCancel} />

						<EditorInfoDialog open={showInfoBox} category={post.categoryId} categories={categories} tags={tags}
						 	onTagsChange={this.handleChangeTags.bind(this)}
							onCategoryChange={this.handleChangeCategory.bind(this)}
							onRequestClose={this.handlePublishDialogClose.bind(this)}
							onRequestSave={this.handleSave.bind(this)}
							onRequestPublish={this.handlePublish.bind(this)} />

						<Codemirror ref="editor" options={options} value={content}
							onChange={this.handleChangeContent.bind(this)} />

					</Dropzone>
				</div>
			</div>
		)
	}
}

Editor.propTypes = {
	currentBlog: PropTypes.object.isRequired,
	post: PropTypes.object,
	categories: PropTypes.array.isRequired,
	onSave: PropTypes.func.isRequired,
	onCancel: PropTypes.func.isRequired
}

export default Editor
