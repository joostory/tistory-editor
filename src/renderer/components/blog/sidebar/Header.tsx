import React from 'react'
import { useAtomValue } from 'jotai'
import {
  Toolbar, Avatar, Typography, Badge, IconButton, SxProps, Theme
} from '@mui/material'
import { ArrowDropDown } from '@mui/icons-material'
import Providers from '../../../constants/Providers'
import { currentAuthState, currentBlogState } from '../../../state/currentBlog' 
import { Blog } from '../../../types'

const styles = {
  root: {
    pl: (theme) => ({ md: theme.spacing(2) }),
    pr: (theme) => ({ md: theme.spacing(1) })
  } as SxProps<Theme>,
  title: {
    flexGrow: 1,
    paddingLeft: (theme) => theme.spacing(2)
  } as SxProps<Theme>,
  avatar: {
    width: (theme) => theme.spacing(5),
    height: (theme) => theme.spacing(5)
  } as SxProps<Theme>,
  smallAvatar: {
    width: (theme) => theme.spacing(2),
    height: (theme) => theme.spacing(2)
  } as SxProps<Theme>
}

interface ProfileAvatarProps {
  blog: Blog
}

function ProfileAvatar({ blog }: ProfileAvatarProps) {
  if (blog.image) {
    return <Avatar src={blog.image} sx={styles.avatar} />
  } else {
    return <Avatar sx={styles.avatar}>{blog.title ? blog.title.slice(0, 1) : ''}</Avatar>
  }
}

interface HeaderProps {
  onSelectBlog: (event: React.MouseEvent<HTMLButtonElement>) => void
}

export default function Header({ onSelectBlog }: HeaderProps) {
  const currentAuth = useAtomValue(currentAuthState)
  const currentBlog = useAtomValue(currentBlogState)

  if (!currentAuth || !currentBlog) {
    return null
  }

  const provider = Providers.find(p => p.name === currentAuth.provider)

  return (
    <Toolbar sx={styles.root}>
      <Badge
        overlap='circular'
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        badgeContent={provider ? <Avatar src={provider.logo} sx={styles.smallAvatar} /> : null}
      >
        <ProfileAvatar blog={currentBlog} />
      </Badge>

      <Typography sx={styles.title}>
        {currentBlog.title}
      </Typography>
      <IconButton onClick={onSelectBlog}><ArrowDropDown /></IconButton>
    </Toolbar>
  )
}
