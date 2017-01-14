import React, { Component, PropTypes } from 'react'
import CircularProgress from 'material-ui/CircularProgress'

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
