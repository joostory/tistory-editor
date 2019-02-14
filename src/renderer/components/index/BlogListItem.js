import React from 'react'

import { Avatar, ListItem, ListItemText } from '@material-ui/core';
import { Stars } from '@material-ui/icons'

export default function BlogListItem({blog, onSelect}) {

  function makeProfileImage(blog) {
    if (blog.profileImageUrl) {
      return <Avatar size={40} src={blog.profileImageUrl} />
    } else {
      return <Avatar size={40}>{blog.title.slice(0,1)}</Avatar>
    }
  }

  return (
    <ListItem className="blog_item" button onClick={e => onSelect(blog)}>
      {makeProfileImage(blog)}

      <ListItemText
        primary={blog.title}
        secondary={(
          <>
            <span className="blog_url">{(blog.secondaryUrl == '')? blog.url : blog.secondaryUrl}</span>
            {blog.description && <span> -- {blog.description}</span>}
          </>
        )}
      />
      {blog.default === 'Y' &&
        <Stars />
      }
    </ListItem>
  );
}
