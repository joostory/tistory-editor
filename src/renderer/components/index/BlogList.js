import React, { Component } from 'react'
import PropTypes from 'prop-types'

import List from '@material-ui/core/List'

import BlogListItem from './BlogListItem'

class BlogList extends Component {
  render() {
    const { blogs, onSelect } = this.props
    return (
      <div className="blog_list">
        <List>
          {blogs.sort((a,b) =>
						(a.default === 'Y')? -1 : b.default === 'Y'? 1 : 0
					).map(blog =>
            <BlogListItem key={blog.url} blog={blog} onSelect={onSelect} />
          )}
        </List>
      </div>
    )
  }
}

BlogList.propTypes = {
  blogs: PropTypes.array.isRequired,
  onSelect: PropTypes.func.isRequired
}

export default BlogList
