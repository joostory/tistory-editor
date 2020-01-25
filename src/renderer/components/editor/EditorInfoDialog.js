import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { Dialog, Button, DialogTitle, DialogContent, DialogActions } from '@material-ui/core'

import ChipInput from 'material-ui-chip-input'

export default function EditorInfoDialog({ onRequestClose, onRequestPublish, onTagsChange, tags, open }) {
  return (
    <Dialog className='post-info-dialog' open={open} maxWidth='md' onClose={onRequestClose}>
      <DialogTitle>글의 속성을 확인해주세요.</DialogTitle>
      <DialogContent className='post-info-dialog-content'>
        <ChipInput className='post-info-form-control'
          label="태그" placeholder="Tag"
          newChipKeyCodes={[13, 188]}
          defaultValue={tags}
          blurBehavior='add'
          onChange={onTagsChange}
          fullWidth
        />
      </DialogContent>

      <DialogActions>
        <Button variant='text' onClick={onRequestClose}>취소</Button>
        <Button variant='text' className='btn btn_tistory' onClick={onRequestPublish}>발행</Button>
      </DialogActions>
      
    </Dialog>
  )
}

