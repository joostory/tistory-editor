import React, { Component, PropTypes } from 'react'

class Header extends Component {

	handleSelect(blog) {
		this.props.onSelect(blog)
	}

	render() {
		const { info, currentBlog, onSelect } = this.props

		return (
			<header className="header">
				<button className="btn btn_back" onClick={() => onSelect(null)}>
					<svg width="20" height="30">
						<g strokeWidth="5" stroke="#666">
							<line x1="17" y1="3" x2="3" y2="16" />
							<line x1="3" y1="14" x2="17" y2="27" />
						</g>
					</svg>
				</button>
				<div className="current_blog">
					<span className="blog_image">
						{currentBlog.profileImageUrl && <img src={currentBlog.profileImageUrl} />}
						{!currentBlog.profileImageUrl &&
							<svg className="svg_profile">
								<circle />
								<text>{currentBlog.title.slice(0,1)}</text>
							</svg>
						}
					</span>
					<span className="blog_title">{currentBlog.title}</span>
				</div>
			</header>
		)
	}
}

Header.propTypes = {
	info: PropTypes.object.isRequired,
	currentBlog: PropTypes.object.isRequired,
	onSelect: PropTypes.func.isRequired
}

export default Header
