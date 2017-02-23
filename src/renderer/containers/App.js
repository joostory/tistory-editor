import React, { Component, PropTypes } from 'react'
import classnames from 'classnames'
import { connect } from 'react-redux'
import Snackbar from 'material-ui/Snackbar'

import { receiveLocalPost, removeLocalPost, updateLocalPost } from '../actions'

import Sidebar from '../components/Sidebar'
import Editor from '../components/Editor'
import Ready from '../components/Ready'
import Index from '../components/Index'
import Blog from '../components/Blog'

import '../../css/editor.css'

class App extends Component {

	constructor(props, context) {
		super(props, context)
		this.state = {
			messageOpen: false
		}
	}

	componentWillReceiveProps(nextProps) {
		const { message } = this.props
		if (nextProps.message && nextProps.message != message) {
			this.setState({
				messageOpen: true
			})
		}
	}

	handleMessageClose() {
		this.setState({
			messageOpen: false
		})
	}

	render() {
		const { user, currentBlog, message } = this.props
		const { messageOpen } = this.state

		let mainContainer;
		if (user && currentBlog) {
			mainContainer = <Blog />

		} else if (user) {
			mainContainer = <Index />

		} else {
			mainContainer = <Ready />
		}

		return (
			<div>
				{mainContainer}

				{messageOpen && message &&
					<Snackbar
						open={messageOpen}
						message={message}
						autoHideDuration={3000}
						onRequestClose={this.handleMessageClose.bind(this)}
					/>
				}
			</div>
		)
	}
}

App.propTypes = {
	user: PropTypes.object,
	blogs: PropTypes.array,
	currentBlog: PropTypes.object
}

const mapStateToProps = (state) => {
  return {
		user: state.user,
		blogs: state.blogs,
		currentBlog: state.currentBlog,
		message: state.message
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
)(App)
