import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { ipcRenderer } from 'electron'

import { Dialog, Button, DialogTitle, DialogContent, DialogActions, RadioGroup, Radio, FormControlLabel } from '@material-ui/core'

import * as EditorMode from '../constants/EditorMode'


export default function Preference() {
  const [open, setOpen] = useState(false)
  const preferences = useSelector(state => state.preferences)
  const defaultEditor = preferences.editor || EditorMode.MARKDOWN

  function handlePreferenceOpen() {
    setOpen(true)
  }

  function handlePreferenceClose() {
    setOpen(false)
  }

  function handleChangeEditor(e, value) {
    ipcRenderer.send("save-preferences", Object.assign({}, preferences, {
      editor: value
    }))
  }

  useEffect(() => {
    ipcRenderer.on("open-preference", handlePreferenceOpen)

    return () => {
      ipcRenderer.removeListener("open-preference", handlePreferenceOpen)  
    }
  }, [])


  return (
    <Dialog open={open} onClose={handlePreferenceClose}>
      <DialogTitle>환경설정</DialogTitle>

      <DialogContent>
        기본 에디터
        <RadioGroup name="editor" value={defaultEditor} onChange={handleChangeEditor}>
          <FormControlLabel value={EditorMode.MARKDOWN} label="Markdown Editor" control={<Radio />} />
          <FormControlLabel value={EditorMode.TINYMCE} label="Rich Editor" control={<Radio />} />
        </RadioGroup>
      </DialogContent>

      <DialogActions>
        <Button variant='text' onClick={handlePreferenceClose}>닫기</Button>
      </DialogActions>
    </Dialog>
  )
}
