import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { ipcRenderer } from 'electron'

class Ready extends Component {

	handleRequestAuth() {
		ipcRenderer.send('request-auth')
	}

	render() {
		const { fetchlock } = this.props
		return (
			<div className='container'>
				<div className='ready'>
					<h1><span className="tistory">Tistory</span> Editor</h1>
					<button className="btn btn_connect btn_tistory" onClick={this.handleRequestAuth.bind(this)}>티스토리 인증</button>
				</div>
			</div>
		)
	}
}


export default Ready
