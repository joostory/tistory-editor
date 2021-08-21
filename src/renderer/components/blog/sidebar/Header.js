import React from 'react'
import { useSelector } from 'react-redux'
import {
  Toolbar, Avatar, Typography, Button,
  makeStyles,
  Badge, IconButton
} from '@material-ui/core'
import { Menu, MoreHoriz, ArrowDropDown } from '@material-ui/icons'
import Providers from '../../../constants/Providers'

const useStyle = makeStyles(theme => ({
  root: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(1)
  },
  title: {
    flexGrow: 1,
    paddingLeft: theme.spacing(2)
  },
  avatar: {
    width: theme.spacing(5),
    height: theme.spacing(5)
  },
  smallAvatar: {
    width: theme.spacing(2),
    height: theme.spacing(2)
  }
}))

function ProfileAvatar({blog}) {
  const classes = useStyle()
	if (blog.image) {
		return <Avatar src={blog.image} className={classes.avatar} />
	} else {
		return <Avatar className={classes.avatar}>{blog.title.slice(0,1)}</Avatar>
	}
}

export default function Header({onSelectBlog}) {
  const classes = useStyle()
  const currentAuth = useSelector(state => state.currentAuth)
  const currentBlog = useSelector(state => state.currentBlog)
  const provider = Providers.find(p => p.name == currentAuth.provider)

	return (
		<Toolbar className={classes.root}>
      <Badge
        overlap='circular'
        anchorOrigin={{vertical:'bottom',horizontal:'right'}}
        badgeContent={<Avatar src={provider.logo} className={classes.smallAvatar} />}
      >
        <ProfileAvatar blog={currentBlog} />
      </Badge>

			<Typography className={classes.title}>
				{currentBlog.title}
			</Typography>
      <IconButton onClick={onSelectBlog}><ArrowDropDown /></IconButton>
		</Toolbar>
	)
}
