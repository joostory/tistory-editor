import React from 'react'
import { Box, Fab, Zoom, Tooltip } from '@mui/material'
import { Save, Close } from '@mui/icons-material'

interface EditorToolbarProps {
  onSaveClick: () => void;
  onCancelClick: () => void;
  disabled?: boolean;
}

export default function EditorToolbar({ onSaveClick, onCancelClick, disabled = false }: EditorToolbarProps) {
  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: (theme) => theme.spacing(3), // 글쓰기 버튼 위치인 spacing(3)과 동일하게 맞춤
        right: (theme) => theme.spacing(3),  // 글쓰기 버튼 위치인 spacing(3)과 동일하게 맞춤
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center', // 플로팅 버튼들을 중앙으로 나란히 정렬
        gap: 2,
        zIndex: 1400, // 에디터 모달 위에 떠 있도록 레이어층 지정
      }}
    >
      {/* 취소 (닫기) 플로팅 버튼 */}
      <Zoom in={true} style={{ transitionDelay: '50ms' }}>
        <Tooltip title="작성 취소" placement="left">
          <Fab
            size="medium"
            color="default"
            onClick={onCancelClick}
            sx={{
              backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(80, 80, 80, 0.8)' : 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(8px)',
              boxShadow: (theme) => theme.shadows[4],
              color: (theme) => theme.palette.text.secondary,
              transition: 'all 0.2s ease',
              '&:hover': {
                transform: 'scale(1.08) rotate(90deg)',
                backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(100, 100, 100, 0.9)' : 'rgba(240, 240, 240, 0.9)',
                color: (theme) => theme.palette.error.main,
              }
            }}
          >
            <Close />
          </Fab>
        </Tooltip>
      </Zoom>

      {/* 완료 (저장) 플로팅 버튼 */}
      <Zoom in={true} style={{ transitionDelay: '100ms' }}>
        <Tooltip title="발행 및 저장" placement="left">
          <Fab
            size="large"
            color="primary"
            onClick={onSaveClick}
            disabled={disabled}
            sx={{
              boxShadow: (theme) => theme.shadows[6],
              transition: 'all 0.2s ease',
              '&:hover': {
                transform: 'scale(1.08)',
              }
            }}
          >
            <Save />
          </Fab>
        </Tooltip>
      </Zoom>
    </Box>
  )
}
