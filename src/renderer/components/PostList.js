import React, { Component, PropTypes } from 'react'
import classnames from 'classnames'
import PostListItem from './PostListItem'
import {List, makeSelectable} from 'material-ui/List'

let SelectableList = makeSelectable(List)

class PostList extends Component {
	constructor(props, context) {
		super(props, context)
		this.state = {
			nextPage: 1
		}
	}

	handleSelect(item) {
		const { onSelect } = this.props
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
			<List className="list" style={{padding:0}} onScroll={this.handleScroll.bind(this)}>
				{posts && posts.map((item, i) =>
					<PostListItem key={i}
						post={item}
						category={categories.find(category => item.categoryId == category.id)}
						selected={item.id == currentPost.id}
						onSelect={this.handleSelect.bind(this)} />
				)}
			</List>
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
