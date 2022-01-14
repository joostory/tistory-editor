import React from 'react'
import { Toolbar, Button } from '@mui/material'
import { makeStyles } from '@mui/styles'

const useStyles = makeStyles(theme => ({
  root: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    height: theme.spacing(8),
    zIndex: 10,
  },
  grow: {
    flexGrow: 1
  }
}))

export default function EditorToolbar({ title, onSaveClick, onCancelClick }) {
  const classes = useStyles()
  return (
    <Toolbar className={classes.root}>
      <Button onClick={onCancelClick} color='default'>
        취소
      </Button>
      
      <div className={classes.grow} />

      <Button variant='contained' color='primary' onClick={onSaveClick} disabled={title.length == 0}>
        완료
      </Button>
    </Toolbar>
  )
}

