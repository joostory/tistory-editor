import React, { Fragment } from 'react'
import dateformat from 'dateformat'
import { ListItem, ListItemText } from '@material-ui/core'
import { Drafts } from '@material-ui/icons'

export default function PostListItem({ post, selected, onSelect }) {
	return (
		<ListItem button selected={selected} className="item" onClick={() => {onSelect(post)}}>
			<ListItemText
				primary={
					<span className="item_title">{post.summary}</span>
				}
				secondary={
					<Fragment>
            <span className="item_category">{post.type}</span>
						<span>{dateformat(new Date(post.date), 'yyyy-mm-dd HH:MM')}</span>
					</Fragment>
				}
			/>

			{post.state != 'published' && <Drafts />}
		</ListItem>
	)
}

