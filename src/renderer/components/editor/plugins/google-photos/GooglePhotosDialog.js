import React, { Component } from 'react'

import { Dialog, Button, DialogTitle, DialogContent, DialogActions } from '@material-ui/core'
import GooglePhotosApp from './GooglePhotosApp'

class GooglePhotosDialog extends Component {
	render() {
		const { open, onClose, onSelectImage } = this.props

		return(
			<Dialog open={open} maxWidth='lg' onClose={onClose}>
        <DialogTitle>Google Photos</DialogTitle>

        <DialogContent className='plugin-google-photos'>
          <GooglePhotosApp onSelectImage={onSelectImage} />
        </DialogContent>

        <DialogActions>
          <Button variant='text' onClick={onClose}>닫기</Button>,
        </DialogActions>
			</Dialog>
		)
	}
}

export default GooglePhotosDialog
