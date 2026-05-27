import React, { useEffect, useRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import ImageGroup from './ImageGroup'
import { Box, ToggleButton, ToggleButtonGroup, Divider } from '@mui/material'
import { ThemeProvider, createTheme } from '@mui/material/styles'

const lightTheme = createTheme({
  palette: {
    mode: 'light',
  },
})
import {
  FormatBold,
  FormatItalic,
  FormatListBulleted,
  FormatListNumbered,
  Code,
  Image as ImageIcon,
  GridView,
  LayersClear
} from '@mui/icons-material'

const styles = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  toolbar: {
    position: 'fixed',
    top: 15,
    width: 700,
    display: 'flex',
    alignItems: 'center',
    borderRadius: (theme) => 1,
    paddingLeft: (theme) => theme.spacing(0.5),
    height: (theme) => theme.spacing(5),
    left: '50%',
    transform: 'translate(-50%,0)',
    zIndex: 10,
    background: 'rgba(255,255,255,0.9)',
    boxShadow: (theme) => theme.shadows[1]
  },
  editorContent: {
    flex: 1,
    overflowY: 'auto',
    backgroundColor: '#fff',
    color: '#333',
    '.ProseMirror': {
      outline: 'none',
      minHeight: '500px',
      padding: '16px',
    },
  },
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
  }
}

const MenuBar = ({ editor, onImageClick }) => {
  if (!editor) {
    return null
  }

  const groupSx = {
    border: 'none',
    '& .MuiToggleButtonGroup-grouped': {
      border: 0,
    }
  }

  const canGroup = () => {
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

  const canUngroup = () => {
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
          sx={{ ...styles.toolbarBtn, fontWeight: 'bold', fontSize: '13px' }}
        >
          H1
        </ToggleButton>
        <ToggleButton
          value="h2"
          selected={editor.isActive('heading', { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          sx={{ ...styles.toolbarBtn, fontWeight: 'bold', fontSize: '12px' }}
        >
          H2
        </ToggleButton>
        <ToggleButton
          value="h3"
          selected={editor.isActive('heading', { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          sx={{ ...styles.toolbarBtn, fontWeight: 'bold', fontSize: '11px' }}
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

export default function TiptapEditor({ value, onChange }) {
  const fileInputRef = useRef(null)
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      ImageGroup,
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON())
    },
    editorProps: {
      style: {
        padding: '20px 0 40px',
        margin: 0
      },
      handleDrop: (view, event, slice, moved) => {
        if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files.length > 0) {
          const files = Array.prototype.slice.call(event.dataTransfer.files)
          const imageFiles = files.filter(file => file.type.indexOf('image/') === 0)
          if (imageFiles.length > 0) {
            insertImages(imageFiles)
            return true
          }
        }
        
        if (moved) {
          const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY })
          const pos = coordinates ? coordinates.pos : null
          
          setTimeout(() => {
            if (editor && pos !== null) {
              editor.commands.groupImagesNearCursor(pos)
            }
          }, 50)
        }
        return false
      },
      handlePaste: (view, event, slice) => {
        if (event.clipboardData && event.clipboardData.files && event.clipboardData.files.length > 0) {
          const files = Array.prototype.slice.call(event.clipboardData.files)
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

  const insertImages = (files) => {
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        if (editor) {
          editor.chain().focus().setImage({ src: e.target.result }).run()
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.prototype.slice.call(e.target.files)
      const imageFiles = files.filter(file => file.type.indexOf('image/') === 0)
      if (imageFiles.length > 0) {
        insertImages(imageFiles)
      }
    }
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
        <MenuBar editor={editor} onImageClick={() => fileInputRef.current?.click()} />
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
      </Box>
    </ThemeProvider>
  )
}
