import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { goIndex } from '../../actions'
import {Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle} from 'material-ui/Toolbar'
import Avatar from 'material-ui/Avatar'
import IconButton from 'material-ui/IconButton'
import NavigationBack from 'material-ui/svg-icons/navigation/arrow-back'
import NoteAdd from 'material-ui/svg-icons/action/note-add'

@connect(state => ({
	user: state.user,
	currentBlog: state.currentBlog
}), dispatch => ({
	handleGoIndex(e) {
		dispatch(goIndex())
	}
}))
class Header extends Component {

	render() {
		const { user, currentBlog, handleGoIndex, onRequestAddPost } = this.props

		let avatar = currentBlog.profileImageUrl? <Avatar src={currentBlog.profileImageUrl} size={30} /> : <Avatar size={30}>{currentBlog.title.slice(0,1)}</Avatar>

		return (
			<Toolbar>
				<ToolbarGroup firstChild={true}>
					<IconButton onClick={handleGoIndex}><NavigationBack /></IconButton>

					{ avatar }

					<ToolbarTitle text={currentBlog.title} style={{marginLeft:'5px', width:'151px', overflow:'hidden'}} />

				</ToolbarGroup>
				<ToolbarGroup lastChild={true}>
					<IconButton onClick={onRequestAddPost} tooltip="새글쓰기"><NoteAdd /></IconButton>
				</ToolbarGroup>
			</Toolbar>
		)
	}
}

Header.propTypes = {
	user: PropTypes.object.isRequired,
	currentBlog: PropTypes.object.isRequired,
	onRequestAddPost: PropTypes.func.isRequired
}

export default Header
