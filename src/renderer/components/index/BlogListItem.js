import React from 'react'

import { Avatar, ListItem, ListItemText, ListItemAvatar, Typography } from '@mui/material';
import { Stars } from '@mui/icons-material'

function ProfileAvatar({blog}) {
  if (blog.image) {
    return <Avatar size={40} src={blog.image} />
  } else {
    return <Avatar size={40}>{blog.title.slice(0,1)}</Avatar>
  }
}

export default function BlogListItem({blog, onSelect}) {

  return (
    <ListItem alignItems='flex-start' button onClick={onSelect}>
      <ListItemAvatar>
        <ProfileAvatar blog={blog} />
      </ListItemAvatar>

      <ListItemText
        primary={blog.title}
        secondary={(
          <>
            <Typography component='span'>{blog.url}</Typography>
            {blog.description &&
              <Typography component='span'> -- {blog.description}</Typography>
            }
          </>
        )}
      />
      {blog.primary &&
        <Stars />
      }
    </ListItem>
  );
}
