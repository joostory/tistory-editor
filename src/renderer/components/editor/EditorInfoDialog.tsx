import React from 'react'
import { Dialog, Button, DialogTitle, DialogContent, DialogActions, Typography } from '@mui/material'
import ChipInput from '#/renderer/components/editor/ChipInput'

interface EditorInfoDialogProps {
  onRequestClose: () => void;
  onRequestPublish: () => void;
  onTagsChange: (tags: string[]) => void;
  tags: string[];
  open: boolean;
}

export default function EditorInfoDialog({ onRequestClose, onRequestPublish, onTagsChange, tags, open }: EditorInfoDialogProps) {
  return (
    <Dialog 
      open={open} 
      fullWidth={true}
      maxWidth='sm' 
      onClose={onRequestClose}
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
            padding: 1,
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.12)'
          }
        }
      }}
    >
      <DialogTitle sx={{ fontWeight: 600, pb: 1 }}>
        포스트 발행 설정
      </DialogTitle>
      
      <DialogContent sx={{ py: 1 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          글을 발행하기 전에 검색과 분류를 돕는 태그를 등록할 수 있습니다.
        </Typography>
        <ChipInput
          label="태그 입력" 
          placeholder="태그를 입력하고 엔터나 쉼표를 누르세요"
          defaultValue={tags}
          onChange={onTagsChange}
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 1.5, pt: 2 }}>
        <Button onClick={onRequestClose} sx={{ color: 'text.secondary', fontWeight: 500 }}>
          취소
        </Button>
        <div style={{ flexGrow: 1 }} />
        <Button 
          variant="contained" 
          color='primary' 
          disableElevation
          onClick={onRequestPublish}
          sx={{ borderRadius: 2, px: 3, fontWeight: 600 }}
        >
          발행하기
        </Button>
      </DialogActions>
    </Dialog>
  )
}
