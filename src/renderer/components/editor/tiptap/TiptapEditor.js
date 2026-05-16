import React, { useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import { Box, ToggleButton, ToggleButtonGroup, Divider } from '@mui/material'
import { ipcRenderer } from 'electron'
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
    display: 'flex',
    flexWrap: 'wrap',
    padding: '8px',
    borderBottom: '1px solid #eee',
    position: 'sticky',
    top: 0,
    backgroundColor: '#fff',
    zIndex: 10,
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
  }
}

const MenuBar = ({ editor, onImageClick }) => {
  if (!editor) {
    return null
  }

  return (
    <Box sx={styles.toolbar}>
      <ToggleButtonGroup size="small">
        <ToggleButton
          value="bold"
          selected={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <FormatBold />
        </ToggleButton>
        <ToggleButton
          value="italic"
          selected={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <FormatItalic />
        </ToggleButton>
        <ToggleButton
          value="code"
          selected={editor.isActive('code')}
          onClick={() => editor.chain().focus().toggleCode().run()}
        >
          <Code />
        </ToggleButton>
      </ToggleButtonGroup>

      <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

      <ToggleButtonGroup size="small">
        <ToggleButton
          value="bulletList"
          selected={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <FormatListBulleted />
        </ToggleButton>
        <ToggleButton
          value="orderedList"
          selected={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <FormatListNumbered />
        </ToggleButton>
      </ToggleButtonGroup>

      <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

      <ToggleButtonGroup size="small">
        <ToggleButton
          value="image"
          onClick={onImageClick}
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
    <Box sx={styles.root}>
      <MenuBar editor={editor} onImageClick={onOpenFile} />
      <Box sx={styles.editorContent}>
        <EditorContent
          className="content"
          editor={editor}
        />
      </Box>
    </Box>
  )
}
