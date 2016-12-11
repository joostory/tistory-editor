import React, { Component, PropTypes } from 'react'
import classnames from 'classnames'
import PostListItem from './PostListItem'

class PostList extends Component {
	constructor(props, context) {
		super(props, context)
		this.state = {
			selectedId: 0,
			nextPage: 1
		}
	}

	handleSelect(item) {
		const { onSelect } = this.props
		onSelect(item)
		this.setState({ selectedId: item.id })
	}

	handleScroll(e) {
		const { onRequestNextPage } = this.props
		const { clientHeight, scrollHeight, scrollTop } = e.target

		if (clientHeight + scrollTop + 200 > scrollHeight) {
			onRequestNextPage()
		}
	}

	render() {
		const { categories, posts, currentPost } = this.props
		const { selectedId } = this.state

		return (
			<ul className="list" onScroll={this.handleScroll.bind(this)}>
				{posts && posts.map((item, i) =>
					<PostListItem key={i}
						post={item}
						category={categories.find(category => item.categoryId == category.id)}
						selected={item.id == selectedId}
						onSelect={this.handleSelect.bind(this)} />
				)}
			</ul>
		)
	}
}

PostList.propTypes = {
	categories: PropTypes.array.isRequired,
	posts: PropTypes.array.isRequired,
	currentPost: PropTypes.object.isRequired,
	onRequestNextPage: PropTypes.func.isRequired,
	onSelect: PropTypes.func.isRequired
}

export default PostList
