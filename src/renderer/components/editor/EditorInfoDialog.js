import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { Dialog, Select, MenuItem, Button, DialogTitle, DialogContent, DialogActions } from '@material-ui/core'

import ChipInput from 'material-ui-chip-input'

class EditorInfoDialog extends Component {
  render() {
    const { onRequestClose, onRequestSave, onRequestPublish, onTagsChange, onCategoryChange, categories, category, tags, open } = this.props

    return (
      <Dialog className='post-info-dialog' open={open} maxWidth='md' onClose={onRequestClose}>
        <DialogTitle>글의 속성을 확인해주세요.</DialogTitle>
        <DialogContent className='post-info-dialog-content'>
          <Select className='post-info-form-control' name="카테고리" value={category} fullWidth onChange={onCategoryChange}>
            <MenuItem value="0">분류없음</MenuItem>
            {categories.map((item, i) =>
              <MenuItem key={i} value={item.id}>{item.label}</MenuItem>
            )}
          </Select>

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
          <Button variant='text' onClick={onRequestSave}>저장</Button>
          <Button variant='text' className='btn btn_tistory' onClick={onRequestPublish}>발행</Button>
        </DialogActions>
        
      </Dialog>
    )
  }
}

EditorInfoDialog.propTypes = {
  onRequestClose: PropTypes.func.isRequired,
  onRequestSave: PropTypes.func.isRequired,
  onRequestPublish: PropTypes.func.isRequired,
  onTagsChange: PropTypes.func.isRequired,
  onCategoryChange: PropTypes.func.isRequired,

  categories: PropTypes.array.isRequired,
  category: PropTypes.string.isRequired,
  tags: PropTypes.array.isRequired,
  open: PropTypes.bool.isRequired
}

export default EditorInfoDialog
