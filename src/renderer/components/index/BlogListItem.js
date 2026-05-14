import React from 'react'

import { Avatar, ListItem, ListItemText, ListItemAvatar, Typography, ListItemButton } from '@mui/material';
import { Stars } from '@mui/icons-material'

function ProfileAvatar({ blog }) {
  if (blog.image) {
    return <Avatar size={40} src={blog.image} />
  } else {
    return <Avatar size={40}>{blog.title.slice(0, 1)}</Avatar>
  }
}

export default function BlogListItem({ blog, onSelect }) {

  return (
    <ListItem disablePadding alignItems='flex-start'>
      <ListItemButton onClick={onSelect} sx={{ alignItems: 'flex-start' }}>
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
          <Stars sx={{ alignSelf: 'center', ml: 1 }} />
        }
      </ListItemButton>
    </ListItem>
  );
}
