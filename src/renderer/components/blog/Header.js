import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import classnames from 'classnames'
import { goIndex } from '../../actions'

import { Toolbar, IconButton, Avatar, Typography } from '@material-ui/core'
import { NoteAdd, NavigateBefore } from '@material-ui/icons'

@connect(state => ({
	currentBlog: state.currentBlog
}), dispatch => ({
	handleGoIndex(e) {
		dispatch(goIndex())
	}
}))
class Header extends Component {

	render() {
		const { currentBlog, handleGoIndex, onRequestAddPost, classes } = this.props

		let avatar = currentBlog.profileImageUrl? <Avatar src={currentBlog.profileImageUrl} size={30} /> : <Avatar size={30}>{currentBlog.title.slice(0,1)}</Avatar>

		return (
			<Toolbar className='header'>
        <IconButton onClick={handleGoIndex}>
          <NavigateBefore />
        </IconButton>

        { avatar }

        <Typography className='blog-title'>
          {currentBlog.title}
        </Typography>

        <IconButton onClick={onRequestAddPost} tooltip="새글쓰기">
          <NoteAdd />
        </IconButton>
			</Toolbar>
		)
	}
}

Header.propTypes = {
	currentBlog: PropTypes.object,
	onRequestAddPost: PropTypes.func.isRequired
}

export default Header
