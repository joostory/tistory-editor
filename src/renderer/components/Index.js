import React, { Component, PropTypes } from 'react'
import { disconnectAuth } from '../actions'

class Index extends Component {

	handleSelect(blog) {
		this.props.onSelect(blog)
	}

	render() {
		const { info } = this.props

		return (
			<div className="container">
				<div className="profile">
					<span className="profile_image">
						<svg className="svg_profile">
							<circle />
							<text>{info.id.slice(0, 1)}</text>
						</svg>
					</span>
					<span className="profile_item">{info.blogs[0].nickname}</span>
					<span className="profile_item">({info.id})</span>

					<button className="btn btn_tistory btn_disconnect" onClick={disconnectAuth}>연결해제</button>
				</div>

				<div className="blog_list">
				{info.blogs.map(blog =>
					<div key={blog.url} className="blog_item" onClick={this.handleSelect.bind(this)}>
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
	info: PropTypes.object.isRequired,
	onSelect: PropTypes.func.isRequired
}

export default Index
