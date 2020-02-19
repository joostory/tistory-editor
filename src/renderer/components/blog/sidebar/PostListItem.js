import React, { Fragment } from 'react'
import { useSelector } from 'react-redux'
import dateformat from 'dateformat'
import { ListItem, ListItemText } from '@material-ui/core'
import { Drafts } from '@material-ui/icons'

function PostTitle({post}) {
  return (
    <span className="item_title">
      {post.title}
    </span>
  )
}

function PostInfo({post}) {
  return (
    <span>{dateformat(new Date(post.date), 'yyyy-mm-dd HH:MM')}</span>
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

