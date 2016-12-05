import React, { Component, PropTypes } from 'react'
import classnames from 'classnames'
import dateformat from 'dateformat'
import Visibility from '../model/Visibility'

class PostList extends Component {
	constructor(props, context) {
		super(props, context)
		this.state = {
			selectedId: 0
		}
	}

	handleSelect(item) {
		const { onSelect } = this.props
		onSelect(item)
		this.setState({ selectedId: item.id })
	}

	render() {
		const { categories, posts, currentPost } = this.props
		const { selectedId } = this.state

		let list = posts? posts.map((item, i) => {
			let className = classnames({
				"item": true,
				"selected": item.id == selectedId
			})
			let visibility = new Visibility(item.visibility)
			let category = categories.find(category => item.categoryId == category.id)
			return (
				<li key={item.id}>
					<a className={className} onClick={e => this.handleSelect(item)}>
						<span className="item_info">
							<span className="item_date">{item.date}</span>
							<span className="item_visibility">{visibility.name}</span>
						</span>

						<span className="item_title">{item.title}</span>

						<span className="item_info">
							{category &&
								<span>{category.label}</span>
							}
						</span>
					</a>
				</li>
			)
		}) : []

		return (
			<ul className="list">
				{list}
			</ul>
		)
	}
}

PostList.propTypes = {
	categories: PropTypes.array.isRequired,
	posts: PropTypes.array.isRequired,
	currentPost: PropTypes.object.isRequired,
	onSelect: PropTypes.func
}

export default PostList
