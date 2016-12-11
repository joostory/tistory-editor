import React, { Component, PropTypes } from 'react'
import classnames from 'classnames'
import dateformat from 'dateformat'
import Visibility from '../model/Visibility'

class PostList extends Component {
	render() {
		const { post, category, selected, onSelect } = this.props

		let className = classnames({
			"item": true,
			"selected": selected
		})
		let visibility = new Visibility(post.visibility)

		return (
			<li>
				<a className={className} onClick={e => onSelect(post)}>
					<span className="item_info">
						<span className="item_date">{post.date}</span>
						<span className="item_visibility">{visibility.name}</span>
					</span>

					<span className="item_title">{post.title}</span>

					<span className="item_info">
						{category &&
							<span>{category.label}</span>
						}
					</span>
				</a>
			</li>
		)
	}
}

PostList.propTypes = {
	post: PropTypes.object.isRequired,
	category: PropTypes.object,
	selected: PropTypes.bool.isRequired,
	onSelect: PropTypes.func.isRequired
}

export default PostList
