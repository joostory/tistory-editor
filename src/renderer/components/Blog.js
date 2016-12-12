import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { ipcRenderer } from 'electron'

import Sidebar from './Sidebar'
import Content from './Content'
import Editor from './Editor'
import * as ContentMode from '../constants/ContentMode'

class Blog extends Component {

	constructor(props, context) {
		super(props, context)
		this.state = {
			posts: [],
			nextPostPage: 1,
			currentPost: {},
			categories: [],
			fetchPostLock: false,
			fetchCategoryLock: false,
			mode: ContentMode.VIEWER
		}

		this.receivePostsListener = this.receivePostsListener.bind(this)
		this.receiveCategoriesListener = this.receiveCategoriesListener.bind(this)
	}

	receivePostsListener(e, posts) {
		console.log("post", posts)
		if (posts && posts.length > 0) {
			this.addPosts(posts)
		}
	}

	receiveCategoriesListener(e, categories) {
		console.log("category", categories)
		this.setState({
			categories: categories,
			fetchCategoryLock: false
		})
	}

	componentWillMount() {
		console.log("add listener")
		ipcRenderer.on("receive-posts", this.receivePostsListener)
		ipcRenderer.on("receive-categories", this.receiveCategoriesListener)
	}

	componentWillUnmount() {
		console.log("remove listener")
		ipcRenderer.removeListener("receive-posts", this.receivePostsListener)
		ipcRenderer.removeListener("receive-categories", this.receiveCategoriesListener)
	}

	addPosts(receivedPosts) {
		const { posts, nextPostPage } = this.state
		let newPosts = posts.slice()
		newPosts.push(...receivedPosts)
		this.setState({
			posts: newPosts,
			nextPostPage: nextPostPage + 1,
			fetchPostLock: false
		})
	}

	componentDidMount() {
		const { currentBlog } = this.props
		const { nextPostPage, fetchPostLock, fetchCategoryLock } = this.state
		if (!fetchPostLock) {
			ipcRenderer.send("fetch-posts", currentBlog.name, nextPostPage)
			this.setState({
				fetchPostLock: true
			})
		}
		if (!fetchCategoryLock) {
			ipcRenderer.send("fetch-categories", currentBlog.name)
			this.setState({
				fetchCategoryLock: true
			})
		}
	}

	handleSelectBlog(blog) {
		this.props.onSelect(blog)
	}

	handleSelectPost(post) {
		this.setState({
			currentPost: post
		})
	}

	handleRequestNextpage() {
		const { currentBlog } = this.props
		const { nextPostPage, fetchPostLock } = this.state
		if (!fetchPostLock) {
			ipcRenderer.send("fetch-posts", currentBlog.name, nextPostPage)
			this.setState({
				fetchPostLock: true
			})
		}
	}

	handleRequestAddPost() {
		console.log("handleRequestAddPost");
		this.setState({
			mode: ContentMode.MARKDOWN
		})

	}
	handleCancelAddPost() {
		this.setState({
			mode: ContentMode.VIEWER
		})
	}
	handleAddPost(post) {
		// TODO add post
	}

	handleSave(post) {
		const { posts } = this.state
		let newPosts = posts.slice()
		let saveIndex = newPosts.findIndex(p => p.id == post.id)
		newPosts[saveIndex] = post

		this.setState({
			posts: newPosts
		})
	}

	render() {
		const { user, currentBlog } = this.props
		const { mode, posts, currentPost, categories } = this.state

		let content;
		if (mode == ContentMode.MARKDOWN) {
			content = <Editor currentBlog={currentBlog} categories={categories} onSave={this.handleAddPost.bind(this)} onCancel={this.handleCancelAddPost.bind(this)} />
		} else {
			content = <Content currentBlog={currentBlog} post={currentPost} categories={categories} onSave={this.handleSave.bind(this)} />
		}

		return (
			<div className="container">
				<Sidebar user={user} currentBlog={currentBlog} posts={posts} categories={categories} currentPost={currentPost}
					onRequestNextPage={this.handleRequestNextpage.bind(this)}
					onRequestAddPost={this.handleRequestAddPost.bind(this)}
					onSelectBlog={this.handleSelectBlog.bind(this)}
					onSelectPost={this.handleSelectPost.bind(this)} />

				{content}
			</div>
		)
	}
}

Blog.propTypes = {
	user: PropTypes.object.isRequired,
	currentBlog: PropTypes.object.isRequired,
	onSelect: PropTypes.func.isRequired
}

export default Blog
