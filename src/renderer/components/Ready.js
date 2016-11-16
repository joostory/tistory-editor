import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { requestAuth } from '../actions'

class Ready extends Component {

	handleAuth() {
		const { dispatch } = this.props
		dispatch(requestAuth())
	}

	render() {
		return (
			<div>
				<button className="btn_auth" onClick={this.handleAuth.bind(this)}>티스토리 인증</button>
			</div>
		)
	}
}

export default connect((dispatch) => { dispatch: dispatch })(Ready)
