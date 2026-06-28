import React from 'react'
import { Editor } from '@tiptap/react'
import { Box, ToggleButton, ToggleButtonGroup, Divider, SxProps, Theme } from '@mui/material'
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
  Link as LinkIcon,
  OndemandVideo
} from '@mui/icons-material'
import { styles } from './styles'

interface MenuBarProps {
  editor: Editor | null
  onImageClick: () => void
  onAddLink: () => void
  onAddLinkCard: () => void
  onAddVideo: () => void
}

export default function MenuBar({ editor, onImageClick, onAddLink, onAddLinkCard, onAddVideo }: MenuBarProps) {
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
          value="link"
          selected={editor.isActive('link')}
          onClick={onAddLink}
          sx={styles.toolbarBtn}
          title="링크 추가/수정"
        >
          <LinkIcon />
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
