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
		console.log("change tag", e.target.value)
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

	handleChangeCategory(e) {
		console.log("change category", e.target.value)
		const { post } = this.state
		let newPost = Object.assign({}, post, {
			categoryId: e.target.value
		})
		this.setState({
			post: newPost
		})
	}

	handleSave() {
		const { currentBlog, onSave } = this.props
		const { post, title, content } = this.state

		let savePost = Object.assign({}, post, {
			title: title,
			content: marked(content)
		})

		console.log("save", savePost)

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
			date: (new Date()).toString(),
			title: title,
			content: marked(content)
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

	toggleInfoBox() {
		const { showInfoBox } = this.state
		this.setState({
			showInfoBox: !showInfoBox
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

		return (
			<div className="content_wrap">
				<div className="editor">
					<div className="statusbar">
						<span className="title">
							<input type="text" value={title} onChange={this.handleChangeTitle.bind(this)} />
						</span>
						<div className="btn_wrap">
							<button className={classnames({
								"btn": true,
								"btn_info": true,
								"active": showInfoBox
							})} onClick={this.toggleInfoBox.bind(this)}>i</button>
							<button className="btn btn_save" onClick={this.handleSave.bind(this)}>저장</button>
							<button className="btn btn_cancel" onClick={onCancel}>취소</button>
						</div>
					</div>

					{showInfoBox &&
						<div className="info_box">
							<label><input type="radio" name="visibility" value="0" checked={visibility == "0"} onChange={this.handleChangeVisibility.bind(this)} /> 저장</label>
							<label><input type="radio" name="visibility" value="3" checked={visibility != "0"} onChange={this.handleChangeVisibility.bind(this)} /> 발행</label>
							<span>
								<input type="text" name="tags" value={tags} onChange={this.handleChangeTags.bind(this)} />
							</span>
							<select value={category} onChange={this.handleChangeCategory.bind(this)}>
								<option value="0">분류없음</option>
								{categories.map((item, i) =>
									<option key={i} value={item.id}>
										{item.label}
									</option>
								)}
							</select>
						</div>
					}

					{showInfoBox &&
						<div className="cover" onClick={this.toggleInfoBox.bind(this)} />
					}

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
