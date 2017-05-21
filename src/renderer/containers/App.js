import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import { connect } from 'react-redux'
import { ipcRenderer } from 'electron'
import Snackbar from 'material-ui/Snackbar'

import { receiveLocalPost, removeLocalPost, updateLocalPost } from '../actions'

import Ready from '../components/Ready'
import Index from '../components/index/Index'
import Blog from '../components/blog/Blog'
import Preference from '../components/Preference'

class App extends Component {

	constructor(props, context) {
		super(props, context)
		this.state = {
			message: "",
			messageOpen: false
		}

		this.handleReceiveMessage = this.handleReceiveMessage.bind(this)
	}

	componentWillMount() {
		ipcRenderer.on("receive-message", this.handleReceiveMessage)
	}

	componentWillUnmount() {
		ipcRenderer.removeListener("receive-message", this.handleReceiveMessage)
	}

	handleReceiveMessage(e, message) {
		this.setState({
			message: message,
			messageOpen: true
		})
	}

	handleMessageClose() {
		this.setState({
			message: "",
			messageOpen: false
		})
	}

	render() {
		const { user, currentBlog } = this.props
		const { message, messageOpen, preferenceOpen } = this.state

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

				<Preference />
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
)(App)
