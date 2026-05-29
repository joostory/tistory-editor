import React, { useEffect, useState } from 'react'
import { ipcRenderer } from 'electron'
import {
  Button, Dialog, DialogTitle, Box,
  List, ListItem, ListItemAvatar, ListItemText, Avatar, CircularProgress,
  ListItemButton
} from '@mui/material'
import { Add } from '@mui/icons-material'
import Providers from '#/renderer/constants/Providers'
import { Provider } from '#/renderer/types'

const styles = {
  btnAdd: {
    width: '100%',
    marginTop: (theme: any) => theme.spacing(1),
    marginBottom: (theme: any) => theme.spacing(2)
  },
  dialogTitle: {
    padding: (theme: any) => theme.spacing(1),
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
}

export default function AuthButton() {
  const [open, setOpen] = useState<boolean>(false)
  const [requestProvider, setRequestProvider] = useState<Provider | null>(null)

  function handleSelectProvider(provider: Provider) {
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
      <Button onClick={() => setOpen(!open)} sx={styles.btnAdd} color='primary' startIcon={<Add />}>
        새로운 블로그 연결
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle sx={styles.dialogTitle}>연결할 서비스 선택</DialogTitle>
        <List sx={styles.dialogList}>
          {Providers.map((provider: any) => (
            <ListItem key={provider.name} disablePadding>
              <ListItemButton onClick={() => handleSelectProvider(provider)}>
                <ListItemAvatar>
                  <Avatar src={provider.logo} />
                </ListItemAvatar>
                <ListItemText primary={provider.label} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Dialog>

      <Dialog open={!!requestProvider} onClose={() => setRequestProvider(null)}>
        <DialogTitle sx={styles.dialogTitle}>{requestProvider?.label} 연결 중</DialogTitle>
        <Box sx={styles.requestBox}>
          <Avatar src={requestProvider?.logo} sx={styles.requestBoxContent} />
          <CircularProgress sx={styles.requestBoxContent} />
        </Box>
      </Dialog>
    </>
  )
}
