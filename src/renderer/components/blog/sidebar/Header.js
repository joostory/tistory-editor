import React from 'react'
import { useRecoilValue } from 'recoil'
import {
  Toolbar, Avatar, Typography, Button,
  Badge, IconButton
} from '@mui/material'
import { ArrowDropDown } from '@mui/icons-material'
import Providers from '../../../constants/Providers'
import { currentAuthState, currentBlogState } from '../../../state/currentBlog' 

const styles = {
  root: {
    pl: (theme) => ({ md: theme.spacing(2) }),
    pr: (theme) => ({ md: theme.spacing(1) })
  },
  title: {
    flexGrow: 1,
    paddingLeft: (theme) => theme.spacing(2)
  },
  avatar: {
    width: (theme) => theme.spacing(5),
    height: (theme) => theme.spacing(5)
  },
  smallAvatar: {
    width: (theme) => theme.spacing(2),
    height: (theme) => theme.spacing(2)
  }
}

function ProfileAvatar({blog}) {
	if (blog.image) {
		return <Avatar src={blog.image} sx={styles.avatar} />
	} else {
		return <Avatar sx={styles.avatar}>{blog.title.slice(0,1)}</Avatar>
	}
}

export default function Header({onSelectBlog}) {
  const currentAuth = useRecoilValue(currentAuthState)
	const currentBlog = useRecoilValue(currentBlogState)
  const provider = Providers.find(p => p.name == currentAuth.provider)

	return (
		<Toolbar sx={styles.root}>
      <Badge
        overlap='circular'
        anchorOrigin={{vertical:'bottom',horizontal:'right'}}
        badgeContent={<Avatar src={provider.logo} sx={styles.smallAvatar} />}
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
