import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { ipcRenderer } from 'electron'

import * as ContentMode from '../constants/ContentMode'
import ContentViewer from './ContentViewer'
import Editor from './Editor'

class Content extends Component {

	constructor(props, context) {
		super(props, context)

		this.state = {
			mode: ContentMode.VIEWER,
			post: props.post
		}
	}

	componentWillMount() {
		console.log("add listener")
		ipcRenderer.on("receive-content", (e, post) => {
			this.setState({
				mode: ContentMode.VIEWER,
				post: post
			})
		})
	}

	componentWillUnmount() {
		console.log("remove listener")
		ipcRenderer.removeAllListeners(["receive-content"])
	}

	componentDidMount() {
		const { currentBlog, post } = this.props
		if (post.id) {
			ipcRenderer.send("fetch-content", currentBlog.name, post.id)
		}
	}

	componentWillReceiveProps(nextProps) {
		const { currentBlog, post } = nextProps
		const currentPost = this.state.post
		if (currentBlog.name && post.id) {
			if (!currentPost || !currentPost.id || currentPost.id != post.id) {
				ipcRenderer.send("fetch-content", currentBlog.name, post.id)
			}
		}
	}

	handleModify() {
		this.setState({
			mode: ContentMode.EDITOR
		})
	}

	handleView() {
		if (!confirm("작성 중인 내용이 사라집니다. 계속하시겠습니까?")) {
			return
		}
		this.setState({
			mode: ContentMode.VIEWER
		})
	}

	handleSave(post) {
		const { onSave } = this.props
		this.setState({
			mode: ContentMode.VIEWER,
			post: post
		})
		onSave(post)
	}

	canExit() {
		return this.state.mode != ContentMode.EDITOR
	}

	render() {
		const { currentBlog, categories, onChange } = this.props
		const { mode, post } = this.state

		if (!post.id) {
			return (
				<div className="content_wrap">
					<div className="content_empty_message">Editor for Tistory</div>
				</div>
			)
		}

		switch (mode) {
			case ContentMode.EDITOR:
				return (
					<Editor ref='editor' currentBlog={currentBlog} post={post} categories={categories}
						onSave={this.handleSave.bind(this)}
						onCancel={this.handleView.bind(this)}
						onChange={onChange} />
				)
			case ContentMode.VIEWER:
			default:
				return (
					<ContentViewer currentBlog={currentBlog} post={post} categories={categories}
						onModify={this.handleModify.bind(this)} />
				)
		}
	}
}

Content.propTypes = {
	currentBlog: PropTypes.object.isRequired,
	post: PropTypes.object.isRequired,
	categories: PropTypes.array.isRequired,
	onSave: PropTypes.func.isRequired
}

export default Content
