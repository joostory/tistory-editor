import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { ipcRenderer } from 'electron'
import autobind from 'autobind-decorator'
import Snackbar from 'material-ui/Snackbar'

import { receiveLocalPost, removeLocalPost, updateLocalPost } from '../actions'

import Main from './Main'
import Preference from '../components/Preference'

class App extends Component {

	constructor(props, context) {
		super(props, context)
		this.state = {
			message: "",
			messageOpen: false
		}
	}

	componentWillMount() {
		ipcRenderer.on("receive-message", this.handleReceiveMessage)
	}

	componentWillUnmount() {
		ipcRenderer.removeListener("receive-message", this.handleReceiveMessage)
	}

	@autobind
	handleReceiveMessage(e, message) {
		this.setState({
			message: message,
			messageOpen: true
		})
	}

	@autobind
	handleMessageClose() {
		this.setState({
			message: "",
			messageOpen: false
		})
	}

	render() {
		const { message, messageOpen, preferenceOpen } = this.state

		return (
			<div>
				<Main />

				{messageOpen && message &&
					<Snackbar
						open={messageOpen}
						message={message}
						autoHideDuration={3000}
						onRequestClose={this.handleMessageClose}
					/>
				}

				<Preference />
			</div>
		)
	}
}

export default App
