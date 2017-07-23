import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { ipcRenderer } from 'electron'
import autobind from 'autobind-decorator'

import Avatar from 'material-ui/Avatar'
import RaisedButton from 'material-ui/RaisedButton'


class IndexProfile extends Component {

  constructor(props, context) {
		super(props, context)
  }

	@autobind
  handleDisconnectAuth() {
		ipcRenderer.send("disconnect-auth")
	}

  render() {
    const { user } = this.props

    let profileImage
    if (user.image) {
      profileImage = <Avatar size={50} src={user.image} />
    } else {
      profileImage = <Avatar size={50}>{user.name.slice(0, 1)}</Avatar>
    }

    return (
      <div className="profile">
        {profileImage}
        <div>{user.name}</div>
        <div>({user.loginId})</div>

        <RaisedButton
          className="btn_disconnect"
          label="연결해제"
          labelStyle={{ color:"#fff" }}
          backgroundColor="#f1631b"
          onClick={this.handleDisconnectAuth} />
      </div>
    )
  }
}

IndexProfile.propTypes = {
  user: PropTypes.object.isRequired
}

export default IndexProfile
