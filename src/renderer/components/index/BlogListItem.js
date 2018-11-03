import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'

import { Avatar, ListItem, ListItemText } from '@material-ui/core';
import { Stars } from '@material-ui/icons'

class BlogListItem extends Component {
  render() {
    const { blog, onSelect } = this.props

    let avatar
    if (blog.profileImageUrl) {
      avatar = <Avatar size={40} src={blog.profileImageUrl} />
    } else {
      avatar = <Avatar size={40}>{blog.title.slice(0,1)}</Avatar>
    }

    let url = (blog.secondaryUrl == 'http://')? blog.url : blog.secondaryUrl
    let info = (
      <Fragment>
        <span className="blog_url">{url}</span>
        {blog.description && <span> -- {blog.description}</span>}
      </Fragment>
    )

    return (
      <ListItem button onClick={e => onSelect(blog)}>
        {avatar}

        <ListItemText primary={blog.title} secondary={info} />
        {blog.default === 'Y' &&
          <Stars />
        }
      </ListItem>
    )
  }
}

BlogListItem.propTypes = {
  blog: PropTypes.object.isRequired,
  onSelect: PropTypes.func.isRequired
}

export default BlogListItem
