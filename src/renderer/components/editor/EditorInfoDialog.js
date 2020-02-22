import React from 'react'
import { useSelector } from 'react-redux'
import { Dialog, Button, DialogTitle, DialogContent, DialogActions, makeStyles } from '@material-ui/core'
import ChipInput from 'material-ui-chip-input'

const useStyles = makeStyles(theme => ({
  grow: {
    flexGrow: 1
  }
}))

export default function EditorInfoDialog({ onRequestClose, onRequestDraft, onRequestPublish, onTagsChange, tags, open }) {
  const classes = useStyles()
  const currentAuth = useSelector(state => state.currentAuth)

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
        <Button onClick={onRequestClose}>취소</Button>
        <div className={classes.grow} />
        {currentAuth.provider == 'tistory' &&
          <Button onClick={onRequestDraft}>저장</Button>
        }
        <Button color='primary' onClick={onRequestPublish}>발행</Button>
      </DialogActions>
    </Dialog>
  )
}

