import React from 'react'

import { Toolbar, TextField, IconButton, Button } from '@material-ui/core'
import { NavigateBefore } from '@material-ui/icons'


export default function EditorToolbar({ title, onTitleChange, onSaveClick, onCancelClick }) {
  return (
    <Toolbar className='editor-header'>
      <IconButton onClick={onCancelClick}><NavigateBefore /></IconButton>
      <div className='header-empty-space' />
      <Button className='btn' variant='text' onClick={onSaveClick} disabled={title.length == 0}>
        저장
      </Button>
    </Toolbar>
  )
}

