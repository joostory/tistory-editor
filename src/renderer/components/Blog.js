import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { ipcRenderer } from 'electron'
import Snackbar from 'material-ui/Snackbar'

import Sidebar from './Sidebar'
import Content from './Content'
import Editor from './Editor'
import * as ContentMode from '../constants/ContentMode'
import Visibility from '../model/Visibility'

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
			selectPostLock: false,
			mode: ContentMode.VIEWER,
			message: "",
			messageOpen: false
		}

		this.receivePostsListener = this.receivePostsListener.bind(this)
		this.receiveCategoriesListener = this.receiveCategoriesListener.bind(this)
		this.notifyFinishUploadFile = this.notifyFinishUploadFile.bind(this)
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
		ipcRenderer.on("finish-add-file", this.notifyFinishUploadFile)
	}

	componentWillUnmount() {
		console.log("remove listener")
		ipcRenderer.removeListener("receive-posts", this.receivePostsListener)
		ipcRenderer.removeListener("receive-categories", this.receiveCategoriesListener)
		ipcRenderer.removeListener("finish-add-file", this.notifyFinishUploadFile)
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
		const { content } = this.refs
		if (!content.canExit() && !confirm("작성 중인 내용이 사라집니다. 계속하시겠습니까?")) {
			return
		}
		this.props.onSelect(blog)
	}

	handleSelectPost(post) {
		const { content } = this.refs
		if (!content.canExit() && !confirm("작성 중인 내용이 사라집니다. 계속하시겠습니까?")) {
			return
		}
		this.setState({
			currentPost: post,
			mode: ContentMode.VIEWER,
			selectPostLock: false
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
			currentPost: {},
			mode: ContentMode.EDITOR
		})

	}

	handleCancelAddPost() {
		if (!confirm("작성 중인 내용이 사라집니다. 계속하시겠습니까?")) {
			return
		}
		this.setState({
			currentPost: {},
			mode: ContentMode.VIEWER
		})
	}

	handleMessageClose() {
		this.setState({
			message: "",
			messageOpen: false
		})
	}

	handleMessageOpen(message) {
		this.setState({
			message: message,
			messageOpen: true
		})
	}

	notifySavePost(post) {
		let visibility = new Visibility(post.visibility)
		this.handleMessageOpen("'" + post.title + "' " + visibility.name + " 완료")
	}

	notifyFinishUploadFile(e, fileUrl) {
		this.handleMessageOpen("이미지 업로드 완료")
	}

	handleAddPost(post) {
		const { posts } = this.state
		let newPosts = posts.slice()
		newPosts.unshift(post)

		this.setState({
			posts: newPosts,
			currentPost: post,
			mode: ContentMode.VIEWER
		})

		this.notifySavePost(post)
	}

	handleSave(post) {
		const { posts } = this.state
		let newPosts = posts.slice()
		let saveIndex = newPosts.findIndex(p => p.id == post.id)
		newPosts[saveIndex] = post

		this.setState({
			posts: newPosts
		})

		this.notifySavePost(post)
	}

	render() {
		const { user, currentBlog } = this.props
		const { mode, posts, currentPost, categories, message, messageOpen } = this.state

		let content;
		if (mode == ContentMode.EDITOR) {
			content = (
				<Editor ref='content' currentBlog={currentBlog} categories={categories}
					onSave={this.handleAddPost.bind(this)}
					onCancel={this.handleCancelAddPost.bind(this)} />
			)
		} else {
			content = (
				<Content ref='content' currentBlog={currentBlog} post={currentPost} categories={categories}
					onSave={this.handleSave.bind(this)} />
			)
		}

		return (
			<div className="container">
				<Sidebar user={user} currentBlog={currentBlog} posts={posts} categories={categories} currentPost={currentPost}
					onRequestNextPage={this.handleRequestNextpage.bind(this)}
					onRequestAddPost={this.handleRequestAddPost.bind(this)}
					onSelectBlog={this.handleSelectBlog.bind(this)}
					onSelectPost={this.handleSelectPost.bind(this)} />

				{content}

				<Snackbar
          open={messageOpen}
          message={message}
          autoHideDuration={3000}
          onRequestClose={this.handleMessageClose.bind(this)}
        />
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
