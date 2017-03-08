import React, { Component, PropTypes } from 'react'
import { ipcRenderer } from 'electron'

import Avatar from 'material-ui/Avatar'
import RaisedButton from 'material-ui/RaisedButton'


class IndexProfile extends Component {

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
          labelStyle={{ color:"#fff", padding: "10px" }}
          backgroundColor="#f1631b"
          onClick={this.handleDisconnectAuth.bind(this)} />
      </div>
    )
  }
}

IndexProfile.propTypes = {
  user: PropTypes.object.isRequired
}

export default IndexProfile
