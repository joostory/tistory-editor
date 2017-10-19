import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { ipcRenderer } from 'electron'
import autobind from 'autobind-decorator'

import RaisedButton from 'material-ui/RaisedButton'
import { pageview } from '../modules/AnalyticsHelper'
import Loading from '../components/Loading'

@connect(state => ({
	status: state.status
}), dispatch => ({}))
class Ready extends Component {

	constructor(props, context) {
		super(props, context)
	}

	componentDidMount() {
		pageview('/ready', '인증대기')
	}

	@autobind
	handleRequestAuth() {
		ipcRenderer.send('request-auth')
	}

	render() {
		const { status } = this.props
		return (
			<div className='container'>
				{ status.fetchUser &&
					<Loading />
				}
				{ !status.fetchUser &&
					<div className='ready'>
						<h1><span className="tistory">Tistory</span> Editor</h1>
						<RaisedButton
							label="티스토리 인증"
							labelStyle={{ color:"#fff" }}
							fullWidth={true}
							backgroundColor="#f1631b"
							onClick={this.handleRequestAuth}
						/>
					</div>
				}
			</div>
		)
	}
}


export default Ready
