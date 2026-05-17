import React, { useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import { Box, ToggleButton, ToggleButtonGroup, Divider } from '@mui/material'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { ipcRenderer } from 'electron'

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
  Image as ImageIcon
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
    '.ProseMirror': {
      outline: 'none',
      minHeight: '500px',
      padding: '16px',
      'p': {
        margin: '0 0 1em 0',
      },
      'img': {
        maxWidth: '100%',
        height: 'auto',
        display: 'block',
        margin: '1em auto',
      }
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
        >
          <ImageIcon />
        </ToggleButton>
      </ToggleButtonGroup>
    </Box>
  )
}

export default function TiptapEditor({ value, onChange, onOpenFile, onImageHandler }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      style: {
        padding: '20px 0 40px',
        margin: 0
      },
      handleDrop: (view, event, slice, moved) => {
        if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
          onImageHandler(Array.prototype.slice.call(event.dataTransfer.files))
          return true
        }
        return false
      },
    }
  })

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value)
    }
  }, [value, editor])

  useEffect(() => {
    function handleFinishUploadFile(e, fileUrl) {
      if (editor) {
        editor.chain().focus().setImage({ src: fileUrl }).run()
      }
    }

    ipcRenderer.on("finish-add-file", handleFinishUploadFile)
    return () => {
      ipcRenderer.removeListener("finish-add-file", handleFinishUploadFile)
    }
  }, [editor])

  return (
    <ThemeProvider theme={lightTheme}>
      <Box sx={styles.root}>
        <MenuBar editor={editor} onImageClick={onOpenFile} />
        <Box sx={styles.editorContent}>
          <EditorContent
            className="content"
            editor={editor}
          />
        </Box>
      </Box>
    </ThemeProvider>
  )
}
