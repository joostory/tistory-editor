import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { ipcRenderer } from 'electron'

import Sidebar from './Sidebar'
import Content from './Content'
import Editor from '../editor/Editor'
import * as ContentMode from '../../constants/ContentMode'
import Visibility from '../../model/Visibility'

class Blog extends Component {

	constructor(props, context) {
		super(props, context)
		this.state = {
			mode: ContentMode.VIEW
		}
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

	render() {
		const { mode } = this.state

		return (
			<div className="container">
				<Sidebar onRequestAddPost={this.handleRequestAddPost.bind(this)} />

				<Content onRequestEditPost={this.handleRequestEditPost.bind(this)}/>

				{(mode === ContentMode.EDIT || mode === ContentMode.ADD) &&
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
