import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { ipcRenderer } from 'electron'

import { disconnectAuth, selectBlog } from '../../actions'
import IndexProfile from './IndexProfile'
import BlogList from './BlogList'

class Index extends Component {

	constructor(props, context) {
		super(props, context)

		this.handleSelectBlog = this.handleSelectBlog.bind(this)
	}

	handleSelectBlog(blog) {
		const { onSelectBlog } = this.props
		ipcRenderer.send("fetch-categories", blog.name)
		onSelectBlog(blog)
	}

	render() {
		const { user, blogs } = this.props

		return (
			<div className="container">
				<IndexProfile user={user} />
				<BlogList blogs={blogs} onSelect={this.handleSelectBlog} />
			</div>
		)
	}
}

const mapStateToProps = (state) => {
  return {
		user: state.user,
		blogs: state.blogs
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    onSelectBlog(blog) {
			dispatch(selectBlog(blog))
		}
  }
}

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(Index)
