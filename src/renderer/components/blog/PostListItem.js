import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'

import { ListItem, ListItemText } from '@material-ui/core'
import Visibility from '../../model/Visibility'

class PostListItem extends Component {
	render() {
		const { post, category, selected, onSelect } = this.props

		let visibility = new Visibility(post.visibility)
		let primaryText = <span className="item_title">{post.title}</span>
		let secondaryText = (
			<Fragment>
				{category && <span className="item_category">{category.label}</span>}
				{post.date}
			</Fragment>
		)

		return (
			<ListItem button selected={selected} className="item" onClick={() => {onSelect(post)}}>

        <ListItemText primary={primaryText} secondary={secondaryText} />

        {visibility.toMaterialIcon()}

      </ListItem>
		)
	}
}

PostListItem.propTypes = {
	post: PropTypes.object.isRequired,
	category: PropTypes.object,
	selected: PropTypes.bool,
	onSelect: PropTypes.func.isRequired
}

export default PostListItem
