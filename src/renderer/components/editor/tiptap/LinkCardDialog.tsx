import React, { useState, useEffect } from 'react'
import { Editor } from '@tiptap/react'
import { ipcRenderer } from 'electron'
import { Dialog, DialogTitle, DialogContent, TextField, DialogActions, Button, CircularProgress } from '@mui/material'

interface LinkCardDialogProps {
  open: boolean
  onClose: () => void
  editor: Editor | null
}

export default function LinkCardDialog({ open, onClose, editor }: LinkCardDialogProps) {
  const [linkCardUrl, setLinkCardUrl] = useState<string>('')
  const [isFetchingOg, setIsFetchingOg] = useState<boolean>(false)

  useEffect(() => {
    if (open) {
      setLinkCardUrl('')
      setIsFetchingOg(false)
    }
  }, [open])

  const handleClose = () => {
    if (isFetchingOg) return
    onClose()
    setLinkCardUrl('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!linkCardUrl || !linkCardUrl.trim()) return

    setIsFetchingOg(true)
    try {
      const result = await ipcRenderer.invoke('fetch-opengraph', linkCardUrl.trim())
      if (result && result.success && editor) {
        const ogData = result.data
        editor.chain().focus().insertContent({
          type: 'linkCard',
          attrs: {
            url: ogData.url,
            title: ogData.title,
            description: ogData.description,
            siteName: ogData.siteName,
            image: ogData.image
          }
        }).run()
        handleClose()
      } else {
        alert("오픈그래프 데이터를 가져오지 못했습니다. 일반 텍스트 링크로 삽입합니다.")
        if (editor) {
          editor.chain().focus().insertContent({
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: linkCardUrl.trim(),
                marks: [{ type: 'link', attrs: { href: linkCardUrl.trim() } }]
              }
            ]
          }).run()
        }
        handleClose()
      }
    } catch (e) {
      console.error('Failed to add link card', e)
      alert("링크 카드 삽입 중 오류가 발생했습니다.")
      handleClose()
    } finally {
      setIsFetchingOg(false)
    }
  }

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      fullWidth
      maxWidth="xs"
    >
      <DialogTitle sx={{ pb: 1, fontSize: '1.1rem', fontWeight: 'bold' }}>
        오픈그래프 링크 카드 추가
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ py: 1 }}>
          <TextField
            autoFocus
            margin="dense"
            id="link-card-url"
            label="URL 주소"
            type="url"
            fullWidth
            variant="outlined"
            size="small"
            value={linkCardUrl}
            onChange={(e) => setLinkCardUrl(e.target.value)}
            disabled={isFetchingOg}
            placeholder="https://example.com"
            required
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} disabled={isFetchingOg} size="small">
            취소
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary" 
            disabled={isFetchingOg || !linkCardUrl.trim()} 
            size="small"
            startIcon={isFetchingOg ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {isFetchingOg ? '가져오는 중...' : '추가'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
