import React, { useState } from 'react'
import { ipcRenderer } from 'electron'
import {
  Button, Dialog, DialogTitle, makeStyles,
  List, ListItem, ListItemAvatar, ListItemText, Avatar
} from '@material-ui/core'
import { Add } from '@material-ui/icons'
import Providers from '../../constants/Providers'

const useStyle = makeStyles(theme => ({
  btnAdd: {
    width: '100%',
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(2)
  }
}))

export default function AuthButton() {
  const classes = useStyle()
  const [open, setOpen] = useState(false)

  function handleSelectProvider(provider) {
    setOpen(false)
    ipcRenderer.send('request-auth', provider.name)
  }

  return (
    <>
      <Button onClick={() => setOpen(!open)} className={classes.btnAdd} color='primary' startIcon={<Add />}>
        새로운 블로그 연결
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>연결할 서비스 선택</DialogTitle>
        <List>
          {Providers.map(provider =>
            <ListItem key={provider.name} button onClick={() => handleSelectProvider(provider)}>
              <ListItemAvatar>
                <Avatar src={provider.logo} />
              </ListItemAvatar>
              <ListItemText
                primary={provider.label}
              />
            </ListItem>
          )}
        </List>
      </Dialog>
    </>
  )
}
