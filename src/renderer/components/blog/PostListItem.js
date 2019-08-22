import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'

import { ListItem, ListItemText } from '@material-ui/core'
import Visibility from '../../model/Visibility'

export default function PostListItem({ post, category, selected, onSelect }) {
	let visibility = new Visibility(post.visibility)

	return (
		<ListItem button selected={selected} className="item" onClick={() => {onSelect(post)}}>

			<ListItemText
				primary={
					<span className="item_title">{post.title}</span>
				}
				secondary={
					<Fragment>
						{category && <span className="item_category">{category.label}</span>}
						{post.date}
					</Fragment>
				}
			/>

			{visibility.toMaterialIcon()}

		</ListItem>
	)
}

