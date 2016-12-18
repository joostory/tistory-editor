import React, { Component, PropTypes } from 'react'
import classnames from 'classnames'
import dateformat from 'dateformat'
import {ListItem} from 'material-ui/List'
import {fade} from 'material-ui/utils/colorManipulator'
import ContentDrafts from 'material-ui/svg-icons/content/drafts'
import Visibility from '../model/Visibility'

class PostList extends Component {
	render() {
		const { post, category, selected, onSelect } = this.props

		let itemClassName = classnames({
			"item": true
		})
		let visibility = new Visibility(post.visibility)
		let primaryText = <div className="item_title">{post.title}</div>
		let secondaryText = (
			<div>
				{category && <span className="item_category">{category.label}</span>}
				{post.date}
			</div>
		)

    const styles = {}
		if (selected) {
			styles.backgroundColor = fade("#333", 0.2)
		}

		return (
			<ListItem className="item" style={styles}
				onClick={() => {onSelect(post)}}
				primaryText={primaryText}
				secondaryText={secondaryText}
				rightIcon={visibility.toMaterialIcon()}
			/>
		)
	}
}

PostList.propTypes = {
	post: PropTypes.object.isRequired,
	category: PropTypes.object,
	selected: PropTypes.bool.isRequired,
	onSelect: PropTypes.func.isRequired
}

export default PostList
