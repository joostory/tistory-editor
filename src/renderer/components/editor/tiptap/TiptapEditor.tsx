import React, { useEffect, useRef, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import ImageGroup from '#/renderer/components/editor/tiptap/extention/ImageGroup'
import LinkCard from '#/renderer/components/editor/tiptap/extention/LinkCard'
import Video from '#/renderer/components/editor/tiptap/extention/Video'
import { Box } from '@mui/material'
import { ThemeProvider } from '@mui/material/styles'

import { styles, lightTheme } from './styles'
import MenuBar from './MenuBar'
import LinkCardDialog from './LinkCardDialog'
import VideoDialog from './VideoDialog'

interface TiptapEditorProps {
  value: any
  onChange: (value: any) => void
}

export default function TiptapEditor({ value, onChange }: TiptapEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isLinkCardDialogOpen, setIsLinkCardDialogOpen] = useState<boolean>(false)
  const [isVideoDialogOpen, setIsVideoDialogOpen] = useState<boolean>(false)

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])

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
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
      debounceTimerRef.current = setTimeout(() => {
        onChange(editor.getJSON())
      }, 300)
    },
    onBlur: ({ editor }) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
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

  useEffect(() => {
    if (!editor || !value) return

    // 사용자가 에디터 입력에 집중하고 있는 경우 (포커스된 상태),
    // 외부 데이터가 에디터 콘텐츠를 리셋하지 않도록 방지하여 한글 조합(IME) 유실을 막습니다.
    if (editor.isFocused) {
      return
    }

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
  }, [value, editor])

  return (
    <ThemeProvider theme={lightTheme}>
      <Box sx={styles.root}>
        <MenuBar 
          editor={editor} 
          onImageClick={() => fileInputRef.current?.click()} 
          onAddLinkCard={() => setIsLinkCardDialogOpen(true)}
          onAddVideo={() => setIsVideoDialogOpen(true)}
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
        
        <LinkCardDialog
          open={isLinkCardDialogOpen}
          onClose={() => setIsLinkCardDialogOpen(false)}
          editor={editor}
        />
        
        <VideoDialog
          open={isVideoDialogOpen}
          onClose={() => setIsVideoDialogOpen(false)}
          editor={editor}
        />
      </Box>
    </ThemeProvider>
  )
}
