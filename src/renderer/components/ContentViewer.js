import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { ipcRenderer } from 'electron'
import Chip from 'material-ui/Chip'
import RaisedButton from 'material-ui/RaisedButton'

class ContentViewer extends Component {
  render() {
    const { post, categories, onModify } = this.props

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
              <span>{post.date}</span>
            </div>
            <div className='viewer_btn'>
              <RaisedButton onClick={onModify}>수정</RaisedButton>
            </div>
          </div>

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
  post: PropTypes.object.isRequired,
  categories: PropTypes.array.isRequired,
  onModify: PropTypes.func.isRequired
}

export default ContentViewer
