import React, { useState, useEffect } from 'react'
import { ipcRenderer } from 'electron'
import { pageview } from '../../modules/AnalyticsHelper'
import {
  Container, Typography, Button, makeStyles,
  Dialog, DialogTitle, List, ListItemText, ListItem
} from '@material-ui/core'
import { Add } from '@material-ui/icons'
import BlogList from './BlogList'


const useStyle = makeStyles(theme => ({
  root: {
    maxWidth: 600,
    marginTop: theme.spacing(5),
    marginBottom: theme.spacing(5)
  },
  title: {
    textAlign: 'center',
    padding: theme.spacing(5)
  },
  btnAdd: {
    width: '100%',
    marginTop: theme.spacing(3)
  }
}))

const Providers = [
  {
    name: 'tistory',
    label: 'Tistory'
  },
  {
    name: 'tumblr',
    label: 'Tumblr'
  }
]

function AuthButton() {
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

export default function Index() {
  const classes = useStyle()

	useEffect(() => {
		pageview('/index', 'Index')
	}, [])

	return (
    <Container fixed className={classes.root}>
      <Typography className={classes.title} variant='h2' component='h1'>
        Editor
      </Typography>
      
      <BlogList />

      <AuthButton />
    </Container>
	)
}
