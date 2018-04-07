import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { ipcRenderer } from 'electron'
import Chip from 'material-ui/Chip'
import IconButton from 'material-ui/IconButton'
import CircularProgress from 'material-ui/CircularProgress'
import OpenInBrowser from 'material-ui/svg-icons/action/open-in-browser'
import ModeEdit from 'material-ui/svg-icons/editor/mode-edit'
import highlightjs from 'highlightjs'
import * as ContentHelper from '../../modules/ContentHelper'
import { pageview } from '../../modules/AnalyticsHelper'

@connect(state => ({
	currentBlog: state.currentBlog,
	post: state.currentPost,
	categories: state.categories
}), dispatch => ({}))
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
			pageview(`/blog/${currentBlog.blogId}/post/${post.id}`, `${post.title}`)
		}
	}

	componentWillReceiveProps(nextProps) {
		const { currentBlog, post } = nextProps
		const { postId } = this.state
		if (postId !== post.id) {
			this.setState({
				postId: post.id,
			})
			ipcRenderer.send("fetch-content", currentBlog.name, post.id)
		}
	}

	componentDidUpdate() {
		const { viewerContent } = this.refs
		Array.prototype.map.call(viewerContent.getElementsByTagName("pre"), pre => {
			highlightjs.highlightBlock(pre)
		})
	}

  render() {
    const { post, categories, onRequestEditPost } = this.props

    let category = categories.find(category => post.categoryId == category.id)
    let tags = []
    if (post.tags && post.tags.tag) {
      tags = tags.concat(post.tags.tag)
    }

		let buttonStyle = {
			verticalAlign:'middle',
			width: '24px',
			height: '24px',
			padding: 0,
			marginLeft: '5px'
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
              <span>{post.date}</span>
							<IconButton href={post.postUrl} tooltip="브라우저에서 보기" style={buttonStyle}><OpenInBrowser /></IconButton>
							<IconButton onClick={onRequestEditPost} tooltip="수정하기" style={buttonStyle}><ModeEdit /></IconButton>
            </div>
          </div>

					{!post.fetched &&
						<div style={{textAlign:'center', marginTop:'100px'}}>
							<CircularProgress size={50} thickness={5} />
						</div>
					}
					<div ref="viewerContent" className="viewer_content content" dangerouslySetInnerHTML={{__html: ContentHelper.makeUrlBase(post.content)}} />

          <div className="viewer_tags">
            {tags.map((item, i) => <Chip key={i} style={{marginRight:'4px'}}>{item}</Chip>)}
          </div>

        </div>
			</div>
    )
  }
}

ContentViewer.propTypes = {
	currentBlog: PropTypes.object,
  post: PropTypes.object,
  categories: PropTypes.array,
	onRequestEditPost: PropTypes.func.isRequired
}

export default ContentViewer
