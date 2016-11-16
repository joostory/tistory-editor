import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { requestAuth } from '../actions'

class Index extends Component {

	render() {
		const { info } = this.props

		return (
			<div>
				index view
				{info.id}
				{info.blogs.map(blog =>
					<div key={blog.url}>{blog.url}</div>
				)}
			</div>
		)
	}
}

Index.propTypes = {
	info: PropTypes.object.isRequired
}

export default connect((dispatch) => { dispatch: dispatch })(Index)
