import React, { useState, useEffect } from 'react'
import { Editor } from '@tiptap/react'
import { Dialog, DialogTitle, DialogContent, TextField, DialogActions, Button } from '@mui/material'

interface VideoDialogProps {
  open: boolean
  onClose: () => void
  editor: Editor | null
}

export default function VideoDialog({ open, onClose, editor }: VideoDialogProps) {
  const [videoUrl, setVideoUrl] = useState<string>('')
  const [videoPoster, setVideoPoster] = useState<string>('')

  useEffect(() => {
    if (open) {
      setVideoUrl('')
      setVideoPoster('')
    }
  }, [open])

  const handleClose = () => {
    onClose()
    setVideoUrl('')
    setVideoPoster('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!videoUrl || !videoUrl.trim()) return

    if (editor) {
      editor.chain().focus().insertContent({
        type: 'video',
        attrs: {
          src: videoUrl.trim(),
          poster: videoPoster.trim() || undefined,
          provider: 'tumblr',
          width: 1920,
          height: 1080
        }
      }).run()
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
        비디오 추가
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ py: 1 }}>
          <TextField
            autoFocus
            margin="dense"
            id="video-url"
            label="비디오 URL 주소"
            type="url"
            fullWidth
            variant="outlined"
            size="small"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://example.com/video.mp4"
            required
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            id="video-poster"
            label="포스터(썸네일) 이미지 URL"
            type="url"
            fullWidth
            variant="outlined"
            size="small"
            value={videoPoster}
            onChange={(e) => setVideoPoster(e.target.value)}
            placeholder="https://example.com/poster.jpg (선택 사항)"
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} size="small">
            취소
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary" 
            disabled={!videoUrl.trim()} 
            size="small"
          >
            추가
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
