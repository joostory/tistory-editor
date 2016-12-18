import React, { Component, PropTypes } from 'react'
import {Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle} from 'material-ui/Toolbar'
import Avatar from 'material-ui/Avatar'
import IconButton from 'material-ui/IconButton'
import NavigationBack from 'material-ui/svg-icons/navigation/arrow-back'
import ContentCreate from 'material-ui/svg-icons/content/create'

class Header extends Component {

	handleSelect(blog) {
		this.props.onSelect(blog)
	}

	render() {
		const { user, currentBlog, onSelect, onRequestAddPost } = this.props

		return (
			<Toolbar>
				<ToolbarGroup firstChild={true}>
					<IconButton onClick={() => onSelect(null)}><NavigationBack /></IconButton>

					{currentBlog.profileImageUrl && <Avatar src={currentBlog.profileImageUrl} size={30} />}
					{!currentBlog.profileImageUrl && <Avatar size={30}>{currentBlog.title.slice(0,1)}</Avatar>}

					<ToolbarTitle text={currentBlog.title} style={{marginLeft:'5px'}} />

				</ToolbarGroup>
				<ToolbarGroup lastChild={true}>
					<IconButton onClick={onRequestAddPost}><ContentCreate /></IconButton>
				</ToolbarGroup>
			</Toolbar>
		)
	}
}

Header.propTypes = {
	user: PropTypes.object.isRequired,
	currentBlog: PropTypes.object.isRequired,
	onSelect: PropTypes.func.isRequired,
	onRequestAddPost: PropTypes.func.isRequired
}

export default Header
