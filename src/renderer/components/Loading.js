import React, { Component } from 'react'
import PropTypes from 'prop-types'
import CircularProgress from '@material-ui/core/CircularProgress'

class Loading extends Component {
	render() {
		return (
			<div className="loading_area">
				<div className="loading_inner">
					<CircularProgress size={60} thickness={7} />
				</div>
			</div>
		)
	}
}

export default Loading
