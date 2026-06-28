import React, { useState, useEffect } from 'react'
import { Editor } from '@tiptap/react'
import { Dialog, DialogTitle, DialogContent, TextField, DialogActions, Button, Box } from '@mui/material'

interface LinkDialogProps {
  open: boolean
  onClose: () => void
  editor: Editor | null
}

export default function LinkDialog({ open, onClose, editor }: LinkDialogProps) {
  const [url, setUrl] = useState<string>('')
  const [text, setText] = useState<string>('')
  const [hasSelection, setHasSelection] = useState<boolean>(false)
  const [isEditMode, setIsEditMode] = useState<boolean>(false)

  useEffect(() => {
    if (open && editor) {
      const isLinkActive = editor.isActive('link')
      setIsEditMode(isLinkActive)

      if (isLinkActive) {
        // 이미 링크가 걸려 있다면 해당 링크 범위 전체를 확장 선택
        editor.chain().focus().extendMarkRange('link').run()
        const currentUrl = editor.getAttributes('link').href || ''
        const { from, to } = editor.state.selection
        const currentText = editor.state.doc.textBetween(from, to, ' ')
        setUrl(currentUrl)
        setText(currentText)
        setHasSelection(true)
      } else {
        const { from, to } = editor.state.selection
        const currentText = editor.state.doc.textBetween(from, to, ' ')
        setUrl('')
        setText(currentText)
        setHasSelection(!editor.state.selection.empty)
      }
    }
  }, [open, editor])

  const handleClose = () => {
    onClose()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editor) return

    const trimmedUrl = url.trim()
    const trimmedText = text.trim()

    if (!trimmedUrl) return

    if (hasSelection) {
      // 선택 영역이 존재할 경우
      editor.chain().focus().extendMarkRange('link').setLink({ href: trimmedUrl }).run()
    } else {
      // 선택 영역이 없을 경우 (텍스트와 링크를 함께 삽입)
      const textToInsert = trimmedText || trimmedUrl
      editor.chain().focus().insertContent({
        type: 'text',
        text: textToInsert,
        marks: [{ type: 'link', attrs: { href: trimmedUrl } }]
      }).run()
    }

    handleClose()
  }

  const handleUnlink = () => {
    if (editor) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
    }
    handleClose()
  }

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      fullWidth
      maxWidth="xs"
    >
      <DialogTitle sx={{ pb: 1, fontSize: '1.1rem', fontWeight: 'bold' }}>
        {isEditMode ? '링크 수정' : '링크 추가'}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ py: 1 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {!hasSelection && (
              <TextField
                autoFocus={!hasSelection}
                margin="dense"
                id="link-text"
                label="링크 텍스트"
                type="text"
                fullWidth
                variant="outlined"
                size="small"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="표시할 텍스트"
                required
              />
            )}
            <TextField
              autoFocus={hasSelection}
              margin="dense"
              id="link-url"
              label="링크 URL"
              type="text"
              fullWidth
              variant="outlined"
              size="small"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              required
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, justifyContent: isEditMode ? 'space-between' : 'flex-end' }}>
          {isEditMode ? (
            <Button onClick={handleUnlink} color="error" size="small" variant="outlined">
              링크 해제
            </Button>
          ) : <Box />}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button onClick={handleClose} size="small">
              취소
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary" 
              disabled={!url.trim() || (!hasSelection && !text.trim())} 
              size="small"
            >
              적용
            </Button>
          </Box>
        </DialogActions>
      </form>
    </Dialog>
  )
}
