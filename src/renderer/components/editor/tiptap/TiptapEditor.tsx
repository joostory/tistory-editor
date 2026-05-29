import React, { useEffect, useRef, useState } from 'react'
import { useEditor, EditorContent, Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import ImageGroup from '#/renderer/components/editor/tiptap/ImageGroup'
import LinkCard from '#/renderer/components/editor/tiptap/LinkCard'
import Video from '#/renderer/components/editor/tiptap/Video'
import { ipcRenderer } from 'electron'
import { Box, ToggleButton, ToggleButtonGroup, Divider, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, CircularProgress, SxProps, Theme } from '@mui/material'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import {
  FormatBold,
  FormatItalic,
  FormatListBulleted,
  FormatListNumbered,
  Code,
  Image as ImageIcon,
  GridView,
  LayersClear,
  AddLink,
  OndemandVideo
} from '@mui/icons-material'

const lightTheme = createTheme({
  palette: {
    mode: 'light',
  },
})

const styles = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  } as SxProps<Theme>,
  toolbar: {
    position: 'fixed',
    top: 15,
    width: 700,
    display: 'flex',
    alignItems: 'center',
    borderRadius: (theme) => theme.spacing(1),
    paddingLeft: (theme) => theme.spacing(0.5),
    height: (theme) => theme.spacing(5),
    left: '50%',
    transform: 'translate(calc(-50% - 6px),0)',
    zIndex: 10,
    background: '#fffc',
    boxShadow: (theme) => theme.shadows[1],
  } as SxProps<Theme>,
  editorContent: {
    flex: 1,
    backgroundColor: '#fff',
    color: '#333',
    '& .ProseMirror': {
      outline: 'none',
      minHeight: '500px',
      padding: '0px !important',
    },
  } as SxProps<Theme>,
  toolbarBtn: {
    border: '0 !important',
    borderRadius: '4px !important',
    margin: '0 2px',
    padding: '5px',
    minWidth: '34px',
    height: '34px',
    color: '#555',
    '&.Mui-selected': {
      backgroundColor: 'rgba(0, 0, 0, 0.08) !important',
      color: '#000',
      '&:hover': {
        backgroundColor: 'rgba(0, 0, 0, 0.12) !important',
      }
    },
    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.04) !important',
    }
  } as SxProps<Theme>
}

interface MenuBarProps {
  editor: Editor | null
  onImageClick: () => void
  onAddLinkCard: () => void
  onAddVideo: () => void
}

const MenuBar: React.FC<MenuBarProps> = ({ editor, onImageClick, onAddLinkCard, onAddVideo }) => {
  if (!editor) {
    return null
  }

  const groupSx = {
    border: 'none',
    '& .MuiToggleButtonGroup-grouped': {
      border: 0,
    }
  }

  const canGroup = (): boolean => {
    try {
      if (!editor) return false
      let canMerge = false
      let consecutiveCount = 0
      
      editor.state.doc.forEach((node) => {
        if (node.type.name === 'image') {
          consecutiveCount++
          if (consecutiveCount > 1) {
            canMerge = true
          }
        } else {
          consecutiveCount = 0
        }
      })
      return canMerge
    } catch (e) {
      return false
    }
  }

  const canUngroup = (): boolean => {
    try {
      return editor.isActive('imageGroup')
    } catch (e) {
      return false
    }
  }

  return (
    <Box sx={styles.toolbar}>
      <ToggleButtonGroup size="small" sx={groupSx}>
        <ToggleButton
          value="bold"
          selected={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
          sx={styles.toolbarBtn}
        >
          <FormatBold />
        </ToggleButton>
        <ToggleButton
          value="italic"
          selected={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          sx={styles.toolbarBtn}
        >
          <FormatItalic />
        </ToggleButton>
        <ToggleButton
          value="code"
          selected={editor.isActive('code')}
          onClick={() => editor.chain().focus().toggleCode().run()}
          sx={styles.toolbarBtn}
        >
          <Code />
        </ToggleButton>
      </ToggleButtonGroup>

      <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

      <ToggleButtonGroup size="small" sx={groupSx}>
        <ToggleButton
          value="h1"
          selected={editor.isActive('heading', { level: 1 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          sx={{ ...styles.toolbarBtn, fontWeight: 'bold', fontSize: '13px' } as SxProps<Theme>}
        >
          H1
        </ToggleButton>
        <ToggleButton
          value="h2"
          selected={editor.isActive('heading', { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          sx={{ ...styles.toolbarBtn, fontWeight: 'bold', fontSize: '12px' } as SxProps<Theme>}
        >
          H2
        </ToggleButton>
        <ToggleButton
          value="h3"
          selected={editor.isActive('heading', { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          sx={{ ...styles.toolbarBtn, fontWeight: 'bold', fontSize: '11px' } as SxProps<Theme>}
        >
          H3
        </ToggleButton>
      </ToggleButtonGroup>

      <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

      <ToggleButtonGroup size="small" sx={groupSx}>
        <ToggleButton
          value="bulletList"
          selected={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          sx={styles.toolbarBtn}
        >
          <FormatListBulleted />
        </ToggleButton>
        <ToggleButton
          value="orderedList"
          selected={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          sx={styles.toolbarBtn}
        >
          <FormatListNumbered />
        </ToggleButton>
      </ToggleButtonGroup>

      <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

      <ToggleButtonGroup size="small" sx={groupSx}>
        <ToggleButton
          value="image"
          onClick={onImageClick}
          sx={styles.toolbarBtn}
          title="이미지 추가"
        >
          <ImageIcon />
        </ToggleButton>
        <ToggleButton
          value="linkCard"
          onClick={onAddLinkCard}
          sx={styles.toolbarBtn}
          title="링크 카드 추가"
        >
          <AddLink />
        </ToggleButton>
        <ToggleButton
          value="video"
          onClick={onAddVideo}
          sx={styles.toolbarBtn}
          title="비디오 추가"
        >
          <OndemandVideo />
        </ToggleButton>
        <ToggleButton
          value="groupImages"
          disabled={!canGroup()}
          onClick={() => editor.commands.groupImages()}
          sx={styles.toolbarBtn}
          title="이미지 묶기 (2개 이상 이미지 드래그 선택 필요)"
        >
          <GridView />
        </ToggleButton>
        <ToggleButton
          value="ungroupImages"
          disabled={!canUngroup()}
          onClick={() => editor.commands.ungroupImages()}
          sx={styles.toolbarBtn}
          title="이미지 묶음 풀기"
        >
          <LayersClear />
        </ToggleButton>
      </ToggleButtonGroup>
    </Box>
  )
}

interface TiptapEditorProps {
  value: any
  onChange: (value: any) => void
}

export default function TiptapEditor({ value, onChange }: TiptapEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isLinkCardDialogOpen, setIsLinkCardDialogOpen] = useState<boolean>(false)
  const [linkCardUrl, setLinkCardUrl] = useState<string>('')
  const [isFetchingOg, setIsFetchingOg] = useState<boolean>(false)
  
  const [isVideoDialogOpen, setIsVideoDialogOpen] = useState<boolean>(false)
  const [videoUrl, setVideoUrl] = useState<string>('')
  const [videoPoster, setVideoPoster] = useState<string>('')

  const insertImages = (files: File[]) => {
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        if (editor && e.target?.result) {
          editor.chain().focus().setImage({ src: e.target.result as string }).run()
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      ImageGroup,
      LinkCard,
      Video,
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON())
    },
    editorProps: {
      attributes: {
        style: 'padding: 20px 0 40px; margin: 0;'
      },
      handleDrop: (view, event, slice, moved) => {
        const dragEvent = event as DragEvent
        if (!moved && dragEvent.dataTransfer && dragEvent.dataTransfer.files && dragEvent.dataTransfer.files.length > 0) {
          const files = Array.from(dragEvent.dataTransfer.files)
          const imageFiles = files.filter(file => file.type.indexOf('image/') === 0)
          if (imageFiles.length > 0) {
            insertImages(imageFiles)
            return true
          }
        }
        
        if (moved) {
          const coordinates = view.posAtCoords({ left: dragEvent.clientX, top: dragEvent.clientY })
          const pos = coordinates ? coordinates.pos : null
          
          setTimeout(() => {
            if (editor && pos !== null) {
              editor.commands.groupImagesNearCursor(pos)
            }
          }, 50)
        }
        return false
      },
      handlePaste: (view, event) => {
        const clipboardEvent = event as ClipboardEvent
        if (clipboardEvent.clipboardData && clipboardEvent.clipboardData.files && clipboardEvent.clipboardData.files.length > 0) {
          const files = Array.from(clipboardEvent.clipboardData.files)
          const imageFiles = files.filter(file => file.type.indexOf('image/') === 0)
          if (imageFiles.length > 0) {
            insertImages(imageFiles)
            return true
          }
        }
        return false
      }
    }
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files) as File[]
      const imageFiles = files.filter(file => file.type.indexOf('image/') === 0)
      if (imageFiles.length > 0) {
        insertImages(imageFiles)
      }
    }
  }

  const handleOpenLinkCardDialog = () => {
    setLinkCardUrl('')
    setIsLinkCardDialogOpen(true)
  }

  const handleCloseLinkCardDialog = () => {
    if (isFetchingOg) return
    setIsLinkCardDialogOpen(false)
    setLinkCardUrl('')
  }

  const handleSubmitLinkCard = async (e: React.FormEvent) => {
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
        handleCloseLinkCardDialog()
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
        handleCloseLinkCardDialog()
      }
    } catch (e) {
      console.error('Failed to add link card', e)
      alert("링크 카드 삽입 중 오류가 발생했습니다.")
      handleCloseLinkCardDialog()
    } finally {
      setIsFetchingOg(false)
    }
  }

  const handleOpenVideoDialog = () => {
    setVideoUrl('')
    setVideoPoster('')
    setIsVideoDialogOpen(true)
  }

  const handleCloseVideoDialog = () => {
    setIsVideoDialogOpen(false)
    setVideoUrl('')
    setVideoPoster('')
  }

  const handleSubmitVideo = (e: React.FormEvent) => {
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
    handleCloseVideoDialog()
  }

  useEffect(() => {
    if (editor && value) {
      if (typeof value === 'object') {
        const currentJson = editor.getJSON()
        if (JSON.stringify(value) !== JSON.stringify(currentJson)) {
          editor.commands.setContent(value)
        }
      } else {
        if (value !== editor.getHTML()) {
          editor.commands.setContent(value)
        }
      }
    }
  }, [value, editor])

  return (
    <ThemeProvider theme={lightTheme}>
      <Box sx={styles.root}>
        <MenuBar 
          editor={editor} 
          onImageClick={() => fileInputRef.current?.click()} 
          onAddLinkCard={handleOpenLinkCardDialog}
          onAddVideo={handleOpenVideoDialog}
        />
        <Box sx={styles.editorContent}>
          <EditorContent
            className="content"
            editor={editor}
          />
        </Box>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          multiple
          style={{ display: 'none' }}
        />
        <Dialog 
          open={isLinkCardDialogOpen} 
          onClose={handleCloseLinkCardDialog}
          fullWidth
          maxWidth="xs"
        >
          <DialogTitle sx={{ pb: 1, fontSize: '1.1rem', fontWeight: 'bold' }}>
            오픈그래프 링크 카드 추가
          </DialogTitle>
          <form onSubmit={handleSubmitLinkCard}>
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
              <Button onClick={handleCloseLinkCardDialog} disabled={isFetchingOg} size="small">
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
        
        <Dialog 
          open={isVideoDialogOpen} 
          onClose={handleCloseVideoDialog}
          fullWidth
          maxWidth="xs"
        >
          <DialogTitle sx={{ pb: 1, fontSize: '1.1rem', fontWeight: 'bold' }}>
            비디오 추가
          </DialogTitle>
          <form onSubmit={handleSubmitVideo}>
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
              <Button onClick={handleCloseVideoDialog} size="small">
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
      </Box>
    </ThemeProvider>
  )
}
