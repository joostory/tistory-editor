import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  Toolbar, IconButton, Avatar, Typography, Button,
  makeStyles
} from '@material-ui/core'

const useStyle = makeStyles(theme => ({
  root: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2)
  },
  title: {
    flexGrow: 1,
    paddingLeft: theme.spacing(2)
  }
}))

function ProfileAvatar({blog}) {
	if (blog.avatar) {
		return <Avatar src={blog.avatar[1].url} size={30} />
	} else {
		return <Avatar size={30}>{blog.title.slice(0,1)}</Avatar>
	}
}

export default function Header({onSelectBlog}) {
  const classes = useStyle()
  const currentBlog = useSelector(state => state.currentBlog)

	return (
		<Toolbar className={classes.root}>
			<ProfileAvatar blog={currentBlog} />

			<Typography className={classes.title}>
				{currentBlog.title}
			</Typography>
      <Button onClick={onSelectBlog}>선택</Button>
		</Toolbar>
	)
}
