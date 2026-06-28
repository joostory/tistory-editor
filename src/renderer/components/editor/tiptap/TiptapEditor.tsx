import React, { useEffect, useRef, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import ImageGroup from '#/renderer/components/editor/tiptap/extention/ImageGroup'
import LinkCard from '#/renderer/components/editor/tiptap/extention/LinkCard'
import Video from '#/renderer/components/editor/tiptap/extention/Video'
import { Box, IconButton } from '@mui/material'
import { ThemeProvider } from '@mui/material/styles'
import CloseIcon from '@mui/icons-material/Close'

import { styles, lightTheme } from './styles'
import MenuBar from './MenuBar'
import LinkCardDialog from './LinkCardDialog'
import LinkDialog from './LinkDialog'
import VideoDialog from './VideoDialog'

interface TiptapEditorProps {
  value: any
  onChange: (value: any) => void
}

export default function TiptapEditor({ value, onChange }: TiptapEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const editorContainerRef = useRef<HTMLDivElement>(null)
  const [isLinkCardDialogOpen, setIsLinkCardDialogOpen] = useState<boolean>(false)
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState<boolean>(false)
  const [isVideoDialogOpen, setIsVideoDialogOpen] = useState<boolean>(false)

  // 플로팅 삭제 버튼 위치 및 타겟 노드 정보 저장
  const [activeImage, setActiveImage] = useState<{
    pos: number
    top: number
    left: number
  } | null>(null)

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
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: 'noopener noreferrer',
          target: '_blank',
        },
      }),
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
      handleDOMEvents: {
        // 에디터 내 마우스 무브 감지하여 이미지 호버 상태 캐치
        mousemove: (view, event) => {
          const target = event.target as HTMLElement
          const img = target.closest('img') as HTMLImageElement | null

          if (img) {
            // LinkCard 내부의 썸네일 이미지는 무시
            if (img.closest('.link-card')) {
              setActiveImage(null)
              return false
            }

            const rect = img.getBoundingClientRect()
            const container = editorContainerRef.current
            
            if (container) {
              const containerRect = container.getBoundingClientRect()
              try {
                const pos = view.posAtDOM(img, 0)
                setActiveImage({
                  pos,
                  // 이미지 우측 상단(안쪽)으로 버튼 위치 지정
                  top: rect.top - containerRect.top + 8,
                  left: rect.right - containerRect.left - 32,
                })
              } catch (e) {
                // posAtDOM 에러 예방
              }
            }
          } else {
            // 마우스가 이미지나 삭제 버튼 밖으로 벗어난 경우 닫기
            const relatedTarget = event.relatedTarget as HTMLElement | null
            const isOverDeleteBtn = relatedTarget?.closest('.image-delete-btn')
            if (!isOverDeleteBtn) {
              setActiveImage(null)
            }
          }
          return false
        }
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

  // 에디터 컨테이너 내부의 모든 A 태그 클릭 이벤트를 캡처링 단계에서 가로채서 기본 동작(외부 브라우저 열기)을 취소함
  useEffect(() => {
    const container = editorContainerRef.current
    if (!container) return

    const handleLinkClick = (event: MouseEvent) => {
      let target = event.target as Node | null
      while (target && target !== container) {
        if (target.nodeName === 'A') {
          event.preventDefault()
          break
        }
        target = target.parentNode
      }
    }

    container.addEventListener('mousedown', handleLinkClick, true)
    return () => {
      container.removeEventListener('mousedown', handleLinkClick, true)
    }
  }, [editor])

  return (
    <ThemeProvider theme={lightTheme}>
      <Box sx={styles.root}>
        <MenuBar 
          editor={editor} 
          onImageClick={() => fileInputRef.current?.click()} 
          onAddLink={() => setIsLinkDialogOpen(true)}
          onAddLinkCard={() => setIsLinkCardDialogOpen(true)}
          onAddVideo={() => setIsVideoDialogOpen(true)}
        />
        
        {/* 마우스 포지션 계산의 기준이 되는 relative 컨테이너 */}
        <Box 
          ref={editorContainerRef} 
          sx={{ ...styles.editorContent, position: 'relative' }}
          onMouseLeave={() => setActiveImage(null)} // 에디터 영역 밖으로 나가면 버튼 즉시 제거
        >
          <EditorContent
            className="content"
            editor={editor}
          />

          {/* 이미지용 플로팅 삭제 버튼 */}
          {activeImage && editor && (
            <IconButton
              className="image-delete-btn"
              onClick={() => {
                editor.commands.deleteRange({ from: activeImage.pos, to: activeImage.pos + 1 })
                setActiveImage(null)
              }}
              size="small"
              sx={{
                position: 'absolute',
                top: activeImage.top,
                left: activeImage.left,
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                color: '#ffffff',
                zIndex: 100,
                transition: 'background-color 0.2s ease, transform 0.2s ease',
                '&:hover': {
                  backgroundColor: 'rgba(239, 68, 68, 0.9)',
                  transform: 'scale(1.1)',
                },
              }}
            >
              <CloseIcon sx={{ fontSize: 16 }} />
            </IconButton>
          )}
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
        
        <LinkDialog
          open={isLinkDialogOpen}
          onClose={() => setIsLinkDialogOpen(false)}
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
