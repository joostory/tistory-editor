import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { requestAuth } from '../actions'

class Ready extends Component {

	render() {
		const { fetchlock } = this.props
		return (
			<div className='container'>
				<div className='ready'>
					<h1>Editor for <span className="tistory">Tistory</span></h1>
					<button className="btn btn_connect btn_tistory" onClick={requestAuth}>티스토리 인증</button>
				</div>
			</div>
		)
	}
}


export default Ready
