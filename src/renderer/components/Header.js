import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { goIndex } from '../actions'
import {Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle} from 'material-ui/Toolbar'
import Avatar from 'material-ui/Avatar'
import IconButton from 'material-ui/IconButton'
import NavigationBack from 'material-ui/svg-icons/navigation/arrow-back'
import ContentCreate from 'material-ui/svg-icons/content/create'

class Header extends Component {

	render() {
		const { user, currentBlog, handleGoIndex, onRequestAddPost } = this.props

		return (
			<Toolbar>
				<ToolbarGroup firstChild={true}>
					<IconButton onClick={handleGoIndex}><NavigationBack /></IconButton>

					{currentBlog.profileImageUrl && <Avatar src={currentBlog.profileImageUrl} size={30} />}
					{!currentBlog.profileImageUrl && <Avatar size={30}>{currentBlog.title.slice(0,1)}</Avatar>}

					<ToolbarTitle text={currentBlog.title} style={{marginLeft:'5px'}} />

				</ToolbarGroup>
				<ToolbarGroup lastChild={true}>
					<IconButton onClick={onRequestAddPost} tooltip="새글쓰기"><ContentCreate /></IconButton>
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

const mapStateToProps = (state) => {
  return {
		user: state.user,
		currentBlog: state.currentBlog
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    handleGoIndex(e) {
			dispatch(goIndex())
		}
  }
}

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(Header)
