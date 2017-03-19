import React, { Component, PropTypes } from 'react'

import { List } from 'material-ui/List'

import BlogListItem from './BlogListItem'

class BlogList extends Component {
  render() {
    const { blogs, onSelect } = this.props
    return (
      <div className="blog_list">
        <List>
          {blogs.map(blog =>
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
