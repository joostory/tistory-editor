import React, { Component } from 'react'
import Dialog from 'material-ui/Dialog'
import FlatButton from 'material-ui/FlatButton'
import GooglePhotosApp from './GooglePhotosApp'

class GooglePhotosDialog extends Component {
	render() {
		const { open, onClose, onSelectImage } = this.props

		const actions = [
      <FlatButton label="닫기" primary={true} onTouchTap={onClose} />,
		]
		
		return(
			<Dialog title="Google Photos" modal={true} open={open} actions={actions} onRequestClose={onClose}>
				<div className='plugin-google-photos'>
					<GooglePhotosApp onSelectImage={onSelectImage} />
				</div>
			</Dialog>
		)
	}
}

export default GooglePhotosDialog
