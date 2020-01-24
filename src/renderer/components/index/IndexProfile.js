import React from 'react'
import { ipcRenderer } from 'electron'

import { Avatar, Button } from '@material-ui/core'


export default function IndexProfile({user}) {

  function makeProfileImage(user) {
    if (user.image) {
      return <Avatar className='avatar' size={50} src={user.image} />
    } else {
      return <Avatar className='avatar' size={50}>{user.name.slice(0, 1)}</Avatar>
    }
  }

  function handleDisconnectAuth() {
    if (confirm("인증을 해제하면 인증 정보가 삭제됩니다. 계속하시겠습니까?")) {
      ipcRenderer.send("disconnect-auth")
    }
  }

  return (
    <div className="profile">
      {makeProfileImage(user)}
      <div>{user.name}</div>

      <Button className='btn btn_tistory btn_disconnect' variant="contained" onClick={handleDisconnectAuth}>
        연결해제
      </Button>
    </div>
  );
}
