import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import classnames from 'classnames'
import { ipcRenderer } from 'electron'

import { List, makeSelectable } from 'material-ui/List'
import CircularProgress from 'material-ui/CircularProgress'

import PostListItem from './PostListItem'
import { selectPost, lockPostsLoad } from '../actions'

let SelectableList = makeSelectable(List)

class PostList extends Component {
	constructor(props, context) {
		super(props, context)
	}

	componentDidMount() {
		this.requestNextPage()
	}

	requestNextPage() {
		const { currentBlog, posts, lockPostsLoad } = this.props
		console.log("request next page", posts)
		if (!posts.lock && posts.hasNext) {
			lockPostsLoad()
			ipcRenderer.send('fetch-posts', currentBlog.name, parseInt(posts.page) + 1)
		}
	}

	handleScroll(e) {
		const { clientHeight, scrollHeight, scrollTop } = e.target

		if (clientHeight + scrollTop + 200 > scrollHeight) {
			this.requestNextPage()
		}
	}

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
			<List className="list" style={{padding:0}} onScroll={this.handleScroll.bind(this)}>
				{posts.list.map((item, i) =>
					<PostListItem key={i}
						post={item}
						category={categories.find(category => item.categoryId == category.id)}
						selected={currentPost && item.id == currentPost.id}
						onSelect={this.handleSelectPost.bind(this)} />
				)}

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
	posts: PropTypes.object.isRequired,
	currentPost: PropTypes.object,
	currentBlog: PropTypes.object,
	categories: PropTypes.array,
	selectPost: PropTypes.func.isRequired
}


const mapStateToProps = (state) => {
  return {
		posts: state.posts,
		currentPost: state.currentPost,
		currentBlog: state.currentBlog,
		categories: state.categories
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    selectPost(post) {
			dispatch(selectPost(post))
		},

		lockPostsLoad() {
			dispatch(lockPostsLoad())
		}
  }
}

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(PostList)
