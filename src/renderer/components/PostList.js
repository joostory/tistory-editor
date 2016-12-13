import React, { Component, PropTypes } from 'react'
import classnames from 'classnames'
import PostListItem from './PostListItem'

class PostList extends Component {
	constructor(props, context) {
		super(props, context)
		this.state = {
			nextPage: 1
		}
	}

	handleSelect(item) {
		const { onSelect } = this.props
		console.log("handleSelct", item)
		onSelect(item)
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

		return (
			<ul className="list" onScroll={this.handleScroll.bind(this)}>
				{posts && posts.map((item, i) =>
					<PostListItem key={i}
						post={item}
						category={categories.find(category => item.categoryId == category.id)}
						selected={item.id == currentPost.id}
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
