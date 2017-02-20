import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { ipcRenderer } from 'electron'
import Snackbar from 'material-ui/Snackbar'

import Sidebar from './Sidebar'
import Content from './Content'
import Editor from './Editor'
import * as ContentMode from '../constants/ContentMode'
import Visibility from '../model/Visibility'

class Blog extends Component {

	constructor(props, context) {
		super(props, context)
		this.state = {
			mode: ContentMode.VIEW,
			message: "",
			messageOpen: false
		}
	}

	handleSelectPost(post) {
		this.setState({
			currentPost: post
		})
	}

	handleRequestAddPost() {
		this.setState({
			mode: ContentMode.ADD
		})
	}

	handleRequestEditPost() {
		this.setState({
			mode: ContentMode.EDIT
		})
	}

	handleFinishEditor() {
		this.setState({
			mode: ContentMode.VIEW
		})
	}

	handleMessageClose() {
		this.setState({
			message: "",
			messageOpen: false
		})
	}

	handleMessageOpen(message) {
		this.setState({
			message: message,
			messageOpen: true
		})
	}

	notifySavePost(post) {
		let visibility = new Visibility(post.visibility)
		this.handleMessageOpen("'" + post.title + "' " + visibility.name + " 완료")
	}

	notifyFinishUploadFile(e, fileUrl) {
		if (fileUrl) {
			this.handleMessageOpen("이미지 업로드 완료")
		} else {
			this.handleMessageOpen("이미지 업로도 실패")
		}
	}

	render() {
		const { mode, message, messageOpen } = this.state

		return (
			<div className="container">
				<Sidebar onRequestAddPost={this.handleRequestAddPost.bind(this)} />

				<Content onRequestEditPost={this.handleRequestEditPost.bind(this)}/>

				<Snackbar
          open={messageOpen}
          message={message}
          autoHideDuration={3000}
          onRequestClose={this.handleMessageClose.bind(this)}
        />

				{(mode == ContentMode.EDIT || mode == ContentMode.ADD) &&
					<Editor mode={mode} onFinish={this.handleFinishEditor.bind(this)} />
				}
			</div>
		)
	}
}

Blog.propTypes = {
	user: PropTypes.object.isRequired,
	currentBlog: PropTypes.object.isRequired
}

const mapStateToProps = (state) => {
  return {
		user: state.user,
		currentBlog: state.currentBlog
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch: dispatch
  }
}

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(Blog)
