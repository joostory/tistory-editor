import React, { Component, PropTypes } from 'react'
import Codemirror from 'react-codemirror'
import 'codemirror/mode/javascript/javascript'
import 'codemirror/mode/xml/xml'
import 'codemirror/mode/markdown/markdown'
import 'codemirror/addon/dialog/dialog'
import 'codemirror/addon/search/search'
import 'codemirror/addon/search/searchcursor'
import 'codemirror/addon/search/jump-to-line'
import dateformat from 'dateformat'

import Database from '../database'

class Editor extends Component {
	constructor(props, context) {
		super(props, context)
		this.state = {
			post: props.post
		}

		this.handleKeyDown = this.handleKeyDown.bind(this)
	}

	componentWillMount() {
		document.body.addEventListener("keydown", this.handleKeyDown, false)
	}

	componentWillUnmount() {
		document.body.removeEventListener("keydown", this.handleKeyDown, false)
	}

	componentWillReceiveProps(nextProps) {
		const { post } = this.state

		this.setState({
			post: nextProps.post
		})
	}

	handleChange(value) {
		const { onSave } = this.props
		const { post } = this.state

		this.setState({
			post: Object.assign({}, post, {
				content: value
			})
		})
	}

	handleSave() {
		const { onSave } = this.props
		const { post } = this.state

		if (!post.id) {
			return
		}

		post.date = new Date()
		Database.getInstance().updatePost(post, () => {
			onSave(post)
			this.setState({
				post: post
			})
		})
	}

	handleKeyDown(e) {
		if (e.metaKey || e.altKey) {
			if (e.keyCode == 83) {
				e.preventDefault()
				this.handleSave()
			}
		}
	}

	render() {
		const { onCancel } = this.props
		const { post } = this.state

		let editor = <div className="empty"><p>post를 선택해 주세요.</p></div>
		if (post.id) {
			var options = {
				lineNumbers: true,
				lineWrapping: true,
				mode: 'markdown',
				theme:'atom-material'
	    }
			editor = <Codemirror value={post.content} onChange={this.handleChange.bind(this)} options={options} />
		}

		let allowAction = post.id != null
		let message = post.id != null? "마지막 수정일: " + dateformat(post.date, 'yyyy/mm/dd HH:MM') : ""
		return (
			<div className="content_wrap">
				<div className="editor">
					<div className="statusbar">
						<p className="message">{message}</p>
						<div className="btn_wrap">
							<button className="btn btn_save" disabled={!allowAction} onClick={this.handleSave.bind(this)}>저장</button>
							<button className="btn btn_cancel" disabled={!allowAction} onClick={onCancel}>취소</button>
						</div>
					</div>

					{editor}
				</div>
			</div>
		)
	}
}

Editor.propTypes = {
	post: PropTypes.object.isRequired,
	onSave: PropTypes.func.isRequired,
	onCancel: PropTypes.func.isRequired
}

export default Editor
