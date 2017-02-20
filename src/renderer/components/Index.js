import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { ipcRenderer } from 'electron'

import { disconnectAuth, selectBlog } from '../actions'

class Index extends Component {

	constructor(props, context) {
		super(props, context)
	}

	handleDisconnectAuth() {
		ipcRenderer.send("disconnect-auth")
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
				<div className="profile">
					<span className="profile_image">
						{user.image && <img src={user.image} />}
						{!user.image &&
							<svg className="svg_profile">
								<circle />
								<text>{user.name.slice(0, 1)}</text>
							</svg>
						}
					</span>
					<span className="profile_item">{user.name}</span>
					<span className="profile_item">({user.loginId})</span>

					<button className="btn btn_tistory btn_disconnect" onClick={this.handleDisconnectAuth.bind(this)}>
						연결해제
					</button>
				</div>

				<div className="blog_list">
					{blogs.map(blog =>
						<div key={blog.url} className="blog_item" onClick={e => this.handleSelectBlog(blog)}>
							<span className="blog_image">
								{blog.profileImageUrl && <img src={blog.profileImageUrl} />}
								{!blog.profileImageUrl &&
									<svg className="svg_profile">
									  <circle />
									  <text>{blog.title.slice(0,1)}</text>
									</svg>
								}
							</span>
							<span className="blog_title">{blog.title}</span>
							<span className="blog_description">{blog.description}</span>
							<span className="blog_url">{blog.url}</span>
						</div>
					)}
				</div>
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
