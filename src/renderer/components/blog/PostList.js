import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import classnames from 'classnames'
import { ipcRenderer } from 'electron'
import autobind from 'autobind-decorator'

import { CircularProgress, List } from '@material-ui/core'

import PostListItem from './PostListItem'
import { selectPost, lockPostsLoad } from '../../actions'

@connect(state => ({
	posts: state.posts,
	currentPost: state.currentPost,
	currentBlog: state.currentBlog,
	categories: state.categories
}), dispatch => ({
	selectPost(post) {
		dispatch(selectPost(post))
	},
	lockPostsLoad() {
		dispatch(lockPostsLoad())
	}
}))
class PostList extends Component {

	componentDidMount() {
		this.requestNextPage()
	}

	requestNextPage() {
		const { currentBlog, posts, lockPostsLoad } = this.props
		if (!posts.lock && posts.hasNext) {
			lockPostsLoad()
			ipcRenderer.send('fetch-posts', currentBlog.name, parseInt(posts.page) + 1)
		}
	}

	@autobind
	handleScroll(e) {
		const { clientHeight, scrollHeight, scrollTop } = e.target

		if (clientHeight + scrollTop + 200 > scrollHeight) {
			this.requestNextPage()
		}
	}

	@autobind
	handleSelectPost(item) {
		const { currentPost, selectPost } = this.props
		if (currentPost && currentPost.id == item.id) {
			return
		}

		selectPost(item)
	}

	render() {
		const { categories, posts, currentPost } = this.props

		return (
			<List className="list" style={{padding:0}} onScroll={this.handleScroll}>
				{posts.list.map((item, i) =>
					<PostListItem key={i}
						post={item}
						category={categories.find(category => item.categoryId == category.id)}
						selected={currentPost && item.id == currentPost.id}
						onSelect={this.handleSelectPost} />
				)}

				{!posts.hasNext && posts.list.length === 0 &&
					<div style={{textAlign:'center', padding:'10px', color:'#aaa'}}>
						No contents
					</div>
				}

				{posts.hasNext &&
					<div style={{textAlign:'center', padding:'10px'}}>
						<CircularProgress size={30} thickness={3} />
					</div>
				}
			</List>
		)
	}
}

PostList.propTypes = {
	posts: PropTypes.object,
	currentPost: PropTypes.object,
	currentBlog: PropTypes.object,
	categories: PropTypes.array,
	selectPost: PropTypes.func
}

export default PostList
