import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { ipcRenderer } from 'electron'
import Chip from 'material-ui/Chip'
import RaisedButton from 'material-ui/RaisedButton'
import CircularProgress from 'material-ui/CircularProgress'
import 'material-design-lite/material.css'

class ContentViewer extends Component {

	constructor(props, context) {
		super(props, context)

		this.state = {
			postId: props.post.id
		}
	}

	componentDidMount() {
		const { currentBlog, post } = this.props
		if (post) {
			ipcRenderer.send("fetch-content", currentBlog.name, post.id)
		}
	}

	componentWillReceiveProps(nextProps) {
		const { currentBlog, post } = nextProps
		const { postId } = this.state
		if (postId != post.id) {
			this.setState({postId : post.id})
			ipcRenderer.send("fetch-content", currentBlog.name, post.id)
		}
	}

  render() {
    const { currentBlog, post, categories, onRequestEditPost } = this.props

    let category = categories.find(category => post.categoryId == category.id)
    let tags = []
    if (post.tags && post.tags.tag) {
      tags = tags.concat(post.tags.tag)
    }

    return (
      <div className='content_wrap'>
        <div className='viewer'>
          <div className='viewer_header'>
            {category &&
              <span className='viewer_category'>{category.label}</span>
            }
    				<h1 className='viewer_title'>{post.title}</h1>
            <div className='viewer_info'>
              <span>{post.date}</span><br/>
							<a href={post.postUrl}>{post.postUrl}</a>
            </div>
            <div className='viewer_btn'>
              <RaisedButton onClick={onRequestEditPost}>수정</RaisedButton>
            </div>
          </div>

					{!post.content &&
						<div style={{textAlign:'center', marginTop:'100px'}}>
							<CircularProgress size={50} thickness={5} />
						</div>
					}
					<div className="viewer_content" dangerouslySetInnerHTML={{__html: post.content}} />

          <div className="viewer_tags">
            {tags.map((item, i) => <Chip key={i} style={{marginRight:'4px'}}>{item}</Chip>)}
          </div>

        </div>
			</div>
    )
  }
}

ContentViewer.propTypes = {
	currentBlog: PropTypes.object.isRequired,
  post: PropTypes.object.isRequired,
  categories: PropTypes.array.isRequired,
	onRequestEditPost: PropTypes.func.isRequired
}

const mapStateToProps = (state) => {
  return {
		currentBlog: state.currentBlog,
		post: state.currentPost,
		categories: state.categories
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch: dispatch
  }
}

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(ContentViewer)
