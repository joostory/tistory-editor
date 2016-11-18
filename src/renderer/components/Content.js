import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

class Content extends Component {
	render() {
		const { post } = this.props

		return (
			<div>content</div>
		)
	}
}

Content.propTypes = {
	post: PropTypes.object.isRequired,
	onSave: PropTypes.func.isRequired
}

export default Content
