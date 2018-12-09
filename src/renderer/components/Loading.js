import React, { Component } from 'react'
import PropTypes from 'prop-types'
import CircularProgress from '@material-ui/core/CircularProgress'

class Loading extends Component {
	render() {
    const { position } = this.props
    let loadingPosition = position
    if (position != 'fixed' && position != 'absolute' && position != 'relative') {
      loadingPosition = 'fixed'
    }

		return (
			<div className={`loading_area ${loadingPosition}`}>
				<div className="loading_inner">
					<CircularProgress size={60} thickness={7} />
				</div>
			</div>
		)
	}
}

Loading.propTypes = {
  position: PropTypes.string
}

export default Loading
