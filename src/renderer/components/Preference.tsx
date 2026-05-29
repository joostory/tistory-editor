import React, { useState, useEffect } from 'react'
import { ipcRenderer } from 'electron'

import {
  Dialog, Button, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Select, MenuItem, SelectChangeEvent
} from '@mui/material'

import * as AppTheme from '#/renderer/constants/AppTheme'
import { useAtomValue } from 'jotai'
import { preferencesState } from '#/renderer/state/preferences'

export default function Preference() {
  const [open, setOpen] = useState<boolean>(false)
  const preferences = useAtomValue(preferencesState)
  const appTheme = preferences.appTheme || AppTheme.SYSTEM

  function handlePreferenceOpen() {
    setOpen(true)
  }

  function handlePreferenceClose() {
    setOpen(false)
  }

  function handleChangeAppTheme(e: SelectChangeEvent<string>) {
    ipcRenderer.send("save-preferences", Object.assign({}, preferences, {
      appTheme: e.target.value
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
        <FormControl fullWidth sx={{ marginBottom: (theme) => theme.spacing(3), marginTop: (theme) => theme.spacing(1) }}>
          <InputLabel>테마</InputLabel>
          <Select label='테마' value={appTheme} onChange={handleChangeAppTheme}>
            <MenuItem value={AppTheme.SYSTEM}>시스템 설정</MenuItem>
            <MenuItem value={AppTheme.LIGHT}>밝음</MenuItem>
            <MenuItem value={AppTheme.DARK}>어두움</MenuItem>
          </Select>
        </FormControl>
      </DialogContent>

      <DialogActions>
        <Button variant='text' onClick={handlePreferenceClose}>닫기</Button>
      </DialogActions>
    </Dialog>
  )
}
