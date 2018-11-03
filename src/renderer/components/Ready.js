import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { ipcRenderer } from 'electron'
import autobind from 'autobind-decorator'

import { withStyles } from '@material-ui/core/styles'
import { Button } from '@material-ui/core'

import TistoryTheme from '../styles/TistoryMuiTheme'

import { pageview } from '../modules/AnalyticsHelper'
import Loading from '../components/Loading'

@withStyles(TistoryTheme)
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
		const { status, classes } = this.props
		return (
			<div className='container'>
				{ status.fetchUser &&
					<Loading />
				}
				{ !status.fetchUser &&
					<div className='ready'>
						<h1><span className="tistory">Tistory</span> Editor</h1>
            <Button className={classes.button} variant="contained" onClick={this.handleRequestAuth}>
              티스토리 인증
            </Button>
					</div>
				}
			</div>
		)
	}
}


export default Ready
