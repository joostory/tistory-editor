import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { List } from 'material-ui/List'

import BlogListItem from './BlogListItem'

class BlogList extends Component {
  render() {
    const { blogs, onSelect } = this.props
    return (
      <div className="blog_list">
        <List>
          {blogs.sort((a,b) =>
						a.default > b.default ? -1 : 1
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
