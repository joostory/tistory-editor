import React, { Component, PropTypes } from 'react'
import { disconnectAuth } from '../actions'

class Index extends Component {

	constructor(props, context) {
		super(props, context)
	}

	handleSelect(blog) {
		this.props.onSelect(blog)
	}

	render() {
		const { user, blogs, onSelect } = this.props

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

					<button className="btn btn_tistory btn_disconnect" onClick={disconnectAuth}>연결해제</button>
				</div>

				<div className="blog_list">
				{blogs.map(blog =>
					<div key={blog.url} className="blog_item" onClick={() => onSelect(blog)}>
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

Index.propTypes = {
	user: PropTypes.object.isRequired,
	blogs: PropTypes.array.isRequired,
	onSelect: PropTypes.func.isRequired
}

export default Index
