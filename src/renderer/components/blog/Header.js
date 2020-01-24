import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { goIndex } from '../../actions'

import { Toolbar, IconButton, Avatar, Typography } from '@material-ui/core'
import { NoteAdd, NavigateBefore } from '@material-ui/icons'

function ProfileAvatar({blog}) {
	if (blog.avatar) {
		return <Avatar src={blog.avatar[1].url} size={30} />
	} else {
		return <Avatar size={30}>{blog.title.slice(0,1)}</Avatar>
	}
}

export default function Header({onRequestAddPost}) {
	const currentBlog = useSelector(state => state.currentBlog)
	const dispatch = useDispatch()


	return (
		<Toolbar className='header'>
			<IconButton onClick={() => dispatch(goIndex())}>
				<NavigateBefore />
			</IconButton>

			<ProfileAvatar blog={currentBlog} />

			<Typography className='blog-title'>
				{currentBlog.title}
			</Typography>

			<IconButton onClick={onRequestAddPost} tooltip="새글쓰기">
				<NoteAdd />
			</IconButton>
		</Toolbar>
	)
}
