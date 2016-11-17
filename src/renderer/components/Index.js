import React, { Component, PropTypes } from 'react'
import { requestAuth } from '../actions'

class Index extends Component {

	render() {
		const { info } = this.props

		return (
			<div className="container">
				<div className="profile">
					<span className="profile_image"></span>
					<span className="profile_item">{info.blogs[0].nickname}</span>
					<span className="profile_item">({info.id})</span>
				</div>

				<div className="blog_list">
				{info.blogs.map(blog =>
					<div key={blog.url} className="blog_item">
						<span className="blog_image">{blog.profileImageUrl && <img src="{blog.profileImageUrl}" />}</span>
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
	info: PropTypes.object.isRequired
}

export default Index
