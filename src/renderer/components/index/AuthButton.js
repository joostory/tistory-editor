import React, { useEffect, useState } from 'react'
import { ipcRenderer } from 'electron'
import {
  Button, Dialog, DialogTitle, makeStyles, Box,
  List, ListItem, ListItemAvatar, ListItemText, Avatar, CircularProgress
} from '@material-ui/core'
import { Add } from '@material-ui/icons'
import Providers from '../../constants/Providers'

const useStyle = makeStyles(theme => ({
  btnAdd: {
    width: '100%',
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(2)
  },
  dialogTitle: {
    padding: theme.spacing(1),
    textAlign: 'center'
  },
  dialogList: {
    width: 500
  },
  requestBox: {
    position: 'relative',
    width: 500,
    height: 320
  },
  requestBoxContent: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    margin: '-20px 0 0 -20px'
  }
}))

export default function AuthButton() {
  const classes = useStyle()
  const [open, setOpen] = useState(false)
  const [requestProvider, setRequestProvider] = useState(null)

  function handleSelectProvider(provider) {
    setOpen(false)
    setRequestProvider(provider)
    ipcRenderer.send('request-auth', provider.name)
  }

  function handleRequestAuthDone() {
    setOpen(false)
    setRequestProvider(null)
  }

  useEffect(() => {
    ipcRenderer.on("request-auth-done", handleRequestAuthDone)
    return () => {
      ipcRenderer.removeListener("request-auth-done", handleRequestAuthDone)
    }
  }, [])

  return (
    <>
      <Button onClick={() => setOpen(!open)} className={classes.btnAdd} color='primary' startIcon={<Add />}>
        새로운 블로그 연결
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle className={classes.dialogTitle}>연결할 서비스 선택</DialogTitle>
        <List className={classes.dialogList}>
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

      <Dialog open={!!requestProvider} onClose={() => setRequestProvider(null)}>
        <DialogTitle className={classes.dialogTitle}>{requestProvider?.label} 연결 중</DialogTitle>
        <Box className={classes.requestBox}>
          <Avatar src={requestProvider?.logo} className={classes.requestBoxContent} />
          <CircularProgress className={classes.requestBoxContent} />
        </Box>
      </Dialog>
    </>
  )
}
