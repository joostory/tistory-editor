import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { ipcRenderer } from 'electron'
import autobind from 'autobind-decorator'

import { withStyles } from '@material-ui/core/styles'
import { Avatar, Button } from '@material-ui/core'

import TistoryTheme from '../../styles/TistoryMuiTheme'

@withStyles(TistoryTheme)
class IndexProfile extends Component {

  constructor(props, context) {
		super(props, context)
  }

	@autobind
  handleDisconnectAuth() {
    if (confirm("인증을 해제하면 인증 정보가 삭제됩니다. 계속하시겠습니까?")) {
      ipcRenderer.send("disconnect-auth")
    }
	}

  render() {
    const { user, classes } = this.props

    let profileImage
    if (user.image) {
      profileImage = <Avatar className={classes.blockCenter} size={50} src={user.image} />
    } else {
      profileImage = <Avatar className={classes.blockCenter} size={50}>{user.name.slice(0, 1)}</Avatar>
    }

    return (
      <div className="profile">
        {profileImage}
        <div>{user.name}</div>
        <div>({user.loginId})</div>

        <Button className={classes.button} variant="contained" onClick={this.handleDisconnectAuth}>
          연결해제
        </Button>
      </div>
    )
  }
}

IndexProfile.propTypes = {
  user: PropTypes.object.isRequired
}

export default IndexProfile
