import React, { useState, useEffect } from 'react'
import { ipcRenderer } from 'electron'

import {
  Dialog, Button, DialogTitle, DialogContent, DialogActions,
  RadioGroup, Radio, FormControl, InputLabel,
  FormControlLabel, FormLabel, Select, MenuItem
} from '@mui/material'

import * as EditorMode from '../constants/EditorMode'
import * as AppTheme from '../constants/AppTheme'
import { useRecoilValue } from 'recoil'
import { preferencesState } from '../state/preferences'


export default function Preference() {
  const [open, setOpen] = useState(false)
  const preferences = useRecoilValue(preferencesState)
  const defaultEditor = preferences.editor || EditorMode.MARKDOWN
  const appTheme = preferences.appTheme || AppTheme.SYSTEM

  function handlePreferenceOpen() {
    setOpen(true)
  }

  function handlePreferenceClose() {
    setOpen(false)
  }

  function handleChangeAppTheme(e) {
    ipcRenderer.send("save-preferences", Object.assign({}, preferences, {
      appTheme: e.target.value
    }))
  }

  function handleChangeEditor(e) {
    ipcRenderer.send("save-preferences", Object.assign({}, preferences, {
      editor: e.target.value
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
        <FormControl fullWidth sx={{marginBottom:(theme) => theme.spacing(3), marginTop:(theme) => theme.spacing(1)}}>
          <InputLabel>테마</InputLabel>
          <Select label='테마' value={appTheme} onChange={handleChangeAppTheme}>
            <MenuItem value={AppTheme.SYSTEM}>시스템 설정</MenuItem>
            <MenuItem value={AppTheme.LIGHT}>밝음</MenuItem>
            <MenuItem value={AppTheme.DARK}>어두움</MenuItem>
          </Select>
        </FormControl>
        
        <FormControl fullWidth>
          <FormLabel>기본 에디터</FormLabel>
          <RadioGroup name="editor" value={defaultEditor} onChange={handleChangeEditor}>
            <FormControlLabel value={EditorMode.MARKDOWN} label="Markdown Editor" control={<Radio />} />
            <FormControlLabel value={EditorMode.TINYMCE} label="Rich Editor" control={<Radio />} />
          </RadioGroup>
        </FormControl>
        
      </DialogContent>

      <DialogActions>
        <Button variant='text' onClick={handlePreferenceClose}>닫기</Button>
      </DialogActions>
    </Dialog>
  )
}
