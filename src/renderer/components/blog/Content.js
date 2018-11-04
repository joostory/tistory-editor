import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import ContentViewer from './ContentViewer'

@connect(state => ({
	post: state.currentPost
}), dispatch => ({}))
class Content extends Component {

	render() {
		const { post, onRequestEditPost } = this.props

		if (!post) {
			return (
				<div className="content_wrap">
					<div className="content_empty_message">Editor for Tistory</div>
				</div>
			)
		} else {
			return <ContentViewer onRequestEditPost={onRequestEditPost} />
		}
	}
}

Content.propTypes = {
	post: PropTypes.object,
	onRequestEditPost: PropTypes.func.isRequired
}

export default Content
