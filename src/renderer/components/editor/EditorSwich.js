import React, { useState } from 'react'
import * as EditorMode from '../../constants/EditorMode'
import { Menu, MenuItem, Fab } from '@material-ui/core'
import { SwapVert } from '@material-ui/icons'


export default function EditorSwitch({ onChange }) {

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
      <Fab color='primary' className="btn_change_editor" aria-owns={open? 'change-editor-menu':undefined} onClick={handleOpenEditorMode}>
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
