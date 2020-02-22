import React from 'react'
import { useSelector } from 'react-redux'
import { Dialog, Button, DialogTitle, DialogContent, DialogActions, makeStyles, Select, MenuItem, FormControl, InputLabel } from '@material-ui/core'
import ChipInput from 'material-ui-chip-input'

const useStyles = makeStyles(theme => ({
  grow: {
    flexGrow: 1
  },
  category: {
    marginBottom: theme.spacing(2)
  }
}))

export default function EditorInfoDialog({ onRequestClose, onRequestDraft, onRequestPublish, onCategoryChange, onTagsChange, categoryId, tags, open }) {
  const classes = useStyles()
  const currentAuth = useSelector(state => state.currentAuth)
  const currentBlog = useSelector(state => state.currentBlog)

  console.log(categoryId, currentBlog.categories)

  return (
    <Dialog open={open} maxWidth='md' onClose={onRequestClose}>
      <DialogTitle>글의 속성을 확인해주세요.</DialogTitle>
      <DialogContent>
        {currentAuth.provider == 'tistory' && currentBlog.categories &&
          <FormControl fullWidth={true}>
            <InputLabel>카테고리</InputLabel>
            <Select className={classes.category} label='카테고리' value={categoryId} onChange={onCategoryChange}>
              <MenuItem value='0'>분류없음</MenuItem>
              {currentBlog.categories.map(item =>
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
        <div className={classes.grow} />
        {currentAuth.provider == 'tistory' &&
          <Button onClick={onRequestDraft}>저장</Button>
        }
        <Button color='primary' onClick={onRequestPublish}>발행</Button>
      </DialogActions>
    </Dialog>
  )
}

