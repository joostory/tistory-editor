import React, { Fragment } from 'react'
import dateformat from 'dateformat'
import { ListItem, ListItemText, Typography } from '@material-ui/core'
import { Drafts } from '@material-ui/icons'

function PostTitle({post}) {
  return (
    <Typography noWrap={true}>
      {post.title}
    </Typography>
  )
}

function PostInfo({post}) {
  return (
    <Typography component='span'>
      {dateformat(new Date(post.date), 'yyyy-mm-dd HH:MM')}
    </Typography>
  )
}

export default function PostListItem({ post, selected, onSelect }) {
	return (
		<ListItem button selected={selected} className="item" onClick={() => {onSelect(post)}}>
			<ListItemText
				primary={<PostTitle post={post} />}
				secondary={<PostInfo post={post} />}
			/>

			{post.state != 'published' && <Drafts />}
		</ListItem>
	)
}

