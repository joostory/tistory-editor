import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { ipcRenderer } from 'electron'

class ContentViewer extends Component {
  render() {
    const { post, categories, onModify } = this.props

    let category = categories.find(category => post.categoryId == category.id)

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
  categories: PropTypes.array.isRequired,
  onModify: PropTypes.func.isRequired
}

export default ContentViewer
