import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { ipcRenderer } from 'electron'

class Content extends Component {

	constructor(props, context) {
		super(props, context)

		this.state = {
			content: "",
			tags: []
		}
		ipcRenderer.on("receive-content", (e, post) => {
			this.setState({
				content: post.content,
				tags: post.tags
			})
		})
	}

	componentWillReceiveProps(nextProps) {
		const { currentBlog, post } = nextProps
		if (currentBlog.name && post.id) {
			ipcRenderer.send("fetch-content", currentBlog.name, post.id)
		}
	}

	render() {
		const { post } = this.props
		const { content } = this.state

		return (
			<div className='editor'>
				<div className="statusbar">
					<span className="message">{post.title}</span>
				</div>

				<div className="content" dangerouslySetInnerHTML={{__html: content}} />
			</div>
		)
	}
}

Content.propTypes = {
	currentBlog: PropTypes.object.isRequired,
	post: PropTypes.object.isRequired,
	onSave: PropTypes.func.isRequired
}

export default Content
