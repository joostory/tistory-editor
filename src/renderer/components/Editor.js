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
import classnames from 'classnames'
import dateformat from 'dateformat'
import toMarkdown from 'to-markdown'
import marked from 'marked'
import Dropzone from 'react-dropzone'
import { ipcRenderer } from 'electron'
import {Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle} from 'material-ui/Toolbar'
import Dialog from 'material-ui/Dialog'
import SelectField from 'material-ui/SelectField'
import MenuItem from 'material-ui/MenuItem'
import TextField from 'material-ui/TextField'
import FlatButton from 'material-ui/FlatButton'
import IconButton from 'material-ui/IconButton'
import ActionDone from 'material-ui/svg-icons/action/done'
import ContentClear from 'material-ui/svg-icons/content/clear'

class Editor extends Component {
	constructor(props, context) {
		super(props, context)

		this.state = {
			post: props.post? props.post: {},
			title: props.post? props.post.title: "",
			content: props.post? toMarkdown(props.post.content): "",
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
				content: toMarkdown(nextProps.post.content)
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

	handleChangeVisibility(e) {
		console.log("change visibility", e.target.value)
		const { post } = this.state
		let newPost = Object.assign({}, post, {
			visibility: e.target.value
		})
		this.setState({
			post: newPost
		})
	}

	handleChangeTags(e) {
		const { post } = this.state
		let newPost = Object.assign({}, post, {
			tags: {
				tag : e.target.value
			}
		})
		this.setState({
			post: newPost
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
		const { post, title, content } = this.state

		let savePost = Object.assign({}, post, {
			title: title,
			visibility: visibility,
			content: marked(content)
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
		const { post, title, content } = this.state

		if (!postId) {
			// handle Error
			alert("오류가 발생했습니다.")
			return
		}

		let savePost = Object.assign({}, post, {
			id: postId,
			date: post.id? post.date : dateformat(new Date(), 'yyyy-mm-dd HH:MM:ss')
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
		const { post, title, content, showInfoBox } = this.state

		let options = {
			lineNumbers: false,
			lineWrapping: true,
			mode: 'markdown',
			theme:'default'
    }

		let tags = ""
		if (post.tags && post.tags.tag) {
			tags = post.tags.tag.toString();
		}

		let visibility = "0"
		if (post.visibility && post.visibility != "0") {
			visibility = post.visibility
		}

		let category = "0"
		if (post.categoryId) {
			category = post.categoryId
		}

		let publishDialogActions = [
			<FlatButton
				label="취소"
				primary={true}
				onTouchTap={this.handlePublishDialogClose.bind(this)}
			/>,
			<FlatButton
				label="저장"
				primary={true}
				onTouchTap={this.handleSave.bind(this)}
			/>,
			<FlatButton
				label="발행"
				primary={true}
				keyboardFocused={true}
				onTouchTap={this.handlePublish.bind(this)}
			/>
		]

		return (
			<div className="content_wrap">
				<div className="editor">
					<Toolbar>
						<ToolbarGroup style={{width:'100%'}}>
							<TextField hintText="Title" type="text" value={title} fullWidth={true} onChange={this.handleChangeTitle.bind(this)} />
						</ToolbarGroup>
						<ToolbarGroup lastChild={true}>
							<IconButton onClick={this.handlePublishDialogOpen.bind(this)}><ActionDone /></IconButton>
							<IconButton onClick={onCancel}><ContentClear /></IconButton>
						</ToolbarGroup>
					</Toolbar>

					<Dialog title="글의 속성을 확인해주세요." modal={false} open={showInfoBox}
						actions={publishDialogActions}
						onRequestClose={this.handlePublishDialogClose.bind(this)}>

						<TextField floatingLabelText="태그" hintText="Tag" type="text" name="tags" value={tags} onChange={this.handleChangeTags.bind(this)} />

						<br />

						<SelectField floatingLabelText="카테고리" value={category} autoWidth={true} onChange={this.handleChangeCategory.bind(this)}>
							<MenuItem value="0" primaryText="분류없음" />
							{categories.map((item, i) =>
								<MenuItem key={i} value={item.id} primaryText={item.label} />
							)}
		        </SelectField>
					</Dialog>

					<Dropzone disableClick={true} accept="image/*" onDrop={this.handleDropFile.bind(this)}>
						<Codemirror ref="editor" value={content} onChange={this.handleChangeContent.bind(this)} options={options} />
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
