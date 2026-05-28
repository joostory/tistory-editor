import React from 'react'
import { Avatar, ListItem, ListItemText, ListItemAvatar, Typography, ListItemButton } from '@mui/material';
import { Stars } from '@mui/icons-material'
import { Blog } from '../../types'

interface ProfileAvatarProps {
  blog: Blog;
}

function ProfileAvatar({ blog }: ProfileAvatarProps) {
  if (blog.image) {
    return <Avatar sx={{ width: 40, height: 40 }} src={blog.image} />
  } else {
    return <Avatar sx={{ width: 40, height: 40 }}>{blog.title.slice(0, 1)}</Avatar>
  }
}

interface BlogListItemProps {
  blog: Blog;
  onSelect: () => void;
}

export default function BlogListItem({ blog, onSelect }: BlogListItemProps) {
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
