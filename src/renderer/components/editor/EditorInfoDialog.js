import React from 'react'
import { useRecoilValue } from 'recoil'
import { Dialog, Button, DialogTitle, DialogContent, DialogActions, Select, MenuItem, FormControl, InputLabel } from '@mui/material'
import ChipInput from './ChipInput'
import { currentAuthState, currentBlogCategoriesState } from '../../state/currentBlog'

const styles = {
  category: {
    marginTop:(theme) => theme.spacing(1),
    marginBottom:(theme) => theme.spacing(2)
  }
}

export default function EditorInfoDialog({ onRequestClose, onRequestDraft, onRequestPublish, onCategoryChange, onTagsChange, categoryId, tags, open }) {
  const currentAuth = useRecoilValue(currentAuthState)
  const categories = useRecoilValue(currentBlogCategoriesState)

  return (
    <Dialog open={open} maxWidth='md' onClose={onRequestClose}>
      <DialogTitle>글의 속성을 확인해주세요.</DialogTitle>
      <DialogContent>
        {currentAuth.provider == 'tistory' && categories &&
          <FormControl fullWidth={true} sx={styles.category}>
            <InputLabel>카테고리</InputLabel>
            <Select label='카테고리' value={categoryId} onChange={onCategoryChange}>
              <MenuItem value='0'>분류없음</MenuItem>
              {categories.map(item =>
                <MenuItem key={item.id} value={item.id}>{item.name}</MenuItem>
              )}
            </Select>
          </FormControl>
        }

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
        {currentAuth.provider == 'tistory' &&
          <Button onClick={onRequestDraft}>저장</Button>
        }
        <Button color='primary' onClick={onRequestPublish}>발행</Button>
      </DialogActions>
    </Dialog>
  )
}

