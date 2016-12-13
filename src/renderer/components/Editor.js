import React, { Component, PropTypes } from 'react'
import Codemirror from 'react-codemirror'
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

	componentWillReceiveProps(nextProps) {
		const { post } = this.state

		console.log(nextProps);

		if (post.id != nextProps.post.id) {
			this.setState({
				post: nextProps.post,
				title: nextProps.title,
				content: toMarkdown(nextProps.post.content)
			})
		}
	}

	handleTitleChange(e) {
		const { title } = this.state
		this.setState({
			title: e.target.value
		})
	}

	handleChange(value) {
		this.setState({
			content: value
		})
	}

	handleSave() {
		const { currentBlog, onSave } = this.props
		const { post, title, content } = this.state

		let savePost = Object.assign({}, post, {
			title: title,
			content: marked(content)
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

	handleKeyDown(e) {
		if (e.metaKey || e.altKey) {
			if (e.keyCode == 83) {
				e.preventDefault()
				this.handleSave()
			}
		}
	}

	toggleInfoBox() {
		const { showInfoBox } = this.state
		this.setState({
			showInfoBox: !showInfoBox
		})
	}

	render() {
		const { onCancel } = this.props
		const { post, title, content, showInfoBox } = this.state

		var options = {
			lineNumbers: false,
			lineWrapping: true,
			mode: 'markdown',
			theme:'default'
    }

		return (
			<div className="content_wrap">
				<div className="editor">
					<div className="statusbar">
						<span className="title">
							<input type="text" value={title} onChange={this.handleTitleChange.bind(this)} />
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
							<label><input type="radio" name="visibility" value="0" selected={post.visibility == 0} /> 저장</label>
							<label><input type="radio" name="visibility" value="3" selected={post.visibility != 0} /> 발행</label>
							<span>
								{post.tags.tag &&
									post.tags.tag.toString()
								}
							</span>
						</div>
					}

					{showInfoBox &&
						<div className="cover" onClick={this.toggleInfoBox.bind(this)} />
					}

					<Codemirror value={content} onChange={this.handleChange.bind(this)} options={options} />

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
