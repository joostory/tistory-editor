import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { ipcRenderer } from 'electron'

class ContentViewer extends Component {
  render() {
    const { post, onModify } = this.props

    return (
      <div className='content_wrap'>
        <div className='viewer'>
          <div className='viewer_header'>
    				<h1 className='viewer_title'>{post.title}</h1>
            <div className='viewer_info'>
              <span>{post.date}</span>
              <button onClick={onModify}>수정</button>
            </div>
          </div>
          <div className="viewer_content" dangerouslySetInnerHTML={{__html: post.content}} />
        </div>
			</div>
    )
  }
}

ContentViewer.propTypes = {
  post: PropTypes.object.isRequired,
  onModify: PropTypes.func.isRequired
}

export default ContentViewer
