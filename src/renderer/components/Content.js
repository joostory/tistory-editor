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
		ipcRenderer.on("receive-content", (e, post) => {
			this.setState({
				mode: ContentMode.VIEWER,
				post: post
			})
		})
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
			mode: ContentMode.MARKDOWN
		})
	}

	handleView() {
		this.setState({
			mode: ContentMode.VIEWER
		})
	}

	render() {
		const { categories } = this.props
		const { mode, post } = this.state

		if (!post.id) {
			return (
				<div className="content_wrap">Select post</div>
			)
		}

		switch (mode) {
			case ContentMode.MARKDOWN:
				return <Editor post={post} categories={categories} onSave={() => {console.log("handleSave")}} onCancel={this.handleView.bind(this)} />
			case ContentMode.WYSIWYG:
			case ContentMode.VIEWER:
			default:
				return <ContentViewer post={post} categories={categories} onModify={this.handleModify.bind(this)} />
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
