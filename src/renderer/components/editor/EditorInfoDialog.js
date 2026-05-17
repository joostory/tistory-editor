import React from 'react'
import { Dialog, Button, DialogTitle, DialogContent, DialogActions } from '@mui/material'
import ChipInput from './ChipInput'


export default function EditorInfoDialog({ onRequestClose, onRequestPublish, onTagsChange, tags, open }) {
  return (
    <Dialog open={open} maxWidth='md' onClose={onRequestClose}>
      <DialogTitle>글의 속성을 확인해주세요.</DialogTitle>
      <DialogContent>
        <ChipInput
          label="태그" placeholder="Tag"
          newChipKeyCodes={[13, 188]}
          defaultValue={tags}
          blurBehavior='add'
          onChange={onTagsChange}
          fullWidth
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={onRequestClose}>취소</Button>
        <div style={{flexGrow: 1}} />
        <Button color='primary' onClick={onRequestPublish}>발행</Button>
      </DialogActions>
    </Dialog>
  )
}

