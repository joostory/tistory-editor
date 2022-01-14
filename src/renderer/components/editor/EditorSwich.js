import React, { useState } from 'react'
import * as EditorMode from '../../constants/EditorMode'
import { Menu, MenuItem, Fab } from '@mui/material'
import { makeStyles } from '@mui/styles'
import { SwapVert } from '@mui/icons-material'

const useStyles = makeStyles(theme => ({
  btn: {
    position: 'fixed',
    right: theme.spacing(3),
    bottom: theme.spacing(3)
  }
}))

export default function EditorSwitch({ editorMode, onChange }) {

  const classes = useStyles()
  const [open, setOpen] = useState(false)
  const [popoverParent, setPopoverParent] = useState(null)

	function handleOpenEditorMode(e) {
    e.preventDefault()
    setOpen(true)
    setPopoverParent(e.currentTarget)
  }
  
	function handleCloseEditorMode() {
    setOpen(false)
    setPopoverParent(null)
  }
  
  function handleChangeEditorMode(editorMode) {
    handleCloseEditorMode()
    onChange(editorMode)
  }

  return (
    <>
      <Fab color='primary' className={classes.btn} aria-owns={open? 'change-editor-menu':undefined} onClick={handleOpenEditorMode}>
        <SwapVert />
      </Fab>

      <Menu
        id='change-editor-menu'
        open={open}
        anchorEl={popoverParent}
        onClose={handleCloseEditorMode}
      >
        <MenuItem selected={editorMode === EditorMode.TINYMCE}
          onClick={e => handleChangeEditorMode(EditorMode.TINYMCE)}>
          Rich Editor
        </MenuItem>
        <MenuItem selected={editorMode === EditorMode.MARKDOWN}
          onClick={e => handleChangeEditorMode(EditorMode.MARKDOWN)}>
          Markdown Editor
        </MenuItem>
      </Menu>
    </>
  )
}
