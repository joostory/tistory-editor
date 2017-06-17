import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { ListItem } from 'material-ui/List'
import Avatar from 'material-ui/Avatar'
import Stars from 'material-ui/svg-icons/action/stars'

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
      <p>
        <span className="blog_url">{url}</span>
        {blog.description && <span> -- {blog.description}</span>}
      </p>
    )

		let defaultBlogIcon;
		if (blog.default === 'Y') {
			defaultBlogIcon = <Stars />
		}

    return (
      <ListItem
        onClick={e => onSelect(blog)}
        leftAvatar={avatar}
				rightIcon={defaultBlogIcon}
        primaryText={blog.title}
        secondaryText={info}
        secondaryTextLines={2}
      />
    )
  }
}

BlogListItem.propTypes = {
  blog: PropTypes.object.isRequired,
  onSelect: PropTypes.func.isRequired
}

export default BlogListItem
