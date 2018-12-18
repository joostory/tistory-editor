import React, { Component } from 'react'
import autobind from 'autobind-decorator'
import { ipcRenderer } from 'electron'

import { Dialog, Button, DialogTitle, DialogContent, DialogActions } from '@material-ui/core'
import GooglePhotos from './GooglePhotos'

class GooglePhotosDialog extends Component {

  constructor(props) {
    super(props)
    this.state = {
      connected: false
    }
  }

  @autobind
  handleDisconnect() {
    this.setState({
      connected: false
    })
  }

  @autobind
  handleConnect() {
    this.setState({
      connected: true
    })
  }

  @autobind
  handleRequestDisconnect() {
    ipcRenderer.send("disconnect-google-photos-auth")
  }

	render() {
    const { connected } = this.state
		const { open, onClose, onSelectImage } = this.props

		return(
			<Dialog open={open} maxWidth='lg' onClose={onClose}>
        <DialogTitle>Google Photos</DialogTitle>

        <DialogContent className='plugin-google-photos'>
          <GooglePhotos
            connected={connected}
            onSelectImage={onSelectImage}
            onConnect={this.handleConnect}
            onDisconnect={this.handleDisconnect}
          />
        </DialogContent>

        <DialogActions>
          {connected &&
            <Button variant='text' color={'secondary'}
              className={'btn-disconnect-google-photos'}
              onClick={this.handleRequestDisconnect}
            >
              연결끊기
            </Button>
          }
          <Button variant='text' onClick={onClose}>닫기</Button>,
        </DialogActions>
			</Dialog>
		)
	}
}

export default GooglePhotosDialog
