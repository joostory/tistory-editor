import React from 'react'
import { useLocation } from 'react-router-dom'
import { Box, IconButton, useTheme } from '@mui/material'
import { Close, Minimize, CropSquare, ArrowBack } from '@mui/icons-material'
import { ipcRenderer } from 'electron'

const TITLEBAR_HEIGHT = 38

export default function Titlebar() {
  const location = useLocation()
  const theme = useTheme()

  const isBlog = location.pathname.startsWith('/blog')
  const isDarwin = process.platform === 'darwin'

  // Windows/Linux용 창 제어 핸들러
  const handleMinimize = () => {
    ipcRenderer.send('window-minimize')
  }
  
  const handleMaximize = () => {
    ipcRenderer.send('window-maximize')
  }

  const handleClose = () => {
    ipcRenderer.send('window-close')
  }

  const handleGoBack = () => {
    window.history.back()
  }

  // 사이드바의 백그라운드 색상만 가져오고, 본문쪽(Index 및 Blog 본문)은 투명처리하여 없는 것처럼 보이게 설정
  const leftBg = theme.palette.mode === 'dark' ? 'rgba(50,50,50,0.95)' : 'rgba(245,245,245,0.95)'
  const borderColor = theme.palette.divider

  return (
    <Box
      sx={{
        height: TITLEBAR_HEIGHT,
        width: '100%',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        userSelect: 'none',
        WebkitAppRegion: 'drag', // 드래그 가능 지정
        fontFamily: theme.typography.fontFamily,
        fontSize: '13px',
        fontWeight: 500,
        color: theme.palette.text.primary,
        overflow: 'hidden',
      }}
    >
      {isBlog ? (
        <>
          {/* 블로그 뷰: 좌측 사이드바 영역의 타이틀바 디자인 (사이드바 헤더 경계선 유지) */}
          <Box
            sx={{
              width: 300,
              height: '100%',
              backgroundColor: leftBg,
              borderRight: `1px solid ${borderColor}`,
              borderBottom: `1px solid ${borderColor}`,
              display: 'flex',
              alignItems: 'center',
              pl: isDarwin ? 10.5 : 2, // macOS 신호등 버튼과 겹치지 않게 패딩 간격 확대 (원래 9 -> 10.5)
              pr: 1,
              boxSizing: 'border-box',
            }}
          >
            {/* 뒤로가기 버튼 */}
            <IconButton
              size="small"
              onClick={handleGoBack}
              sx={{
                WebkitAppRegion: 'no-drag',
                mr: 1,
                color: theme.palette.text.secondary,
                padding: '4px',
              }}
              title="뒤로 가기"
            >
              <ArrowBack fontSize="small" />
            </IconButton>
          </Box>

          {/* 블로그 뷰: 우측 본문 영역의 타이틀바 디자인 (배경 투명 및 테두리 제거로 없는 것처럼 보이게 처리) */}
          <Box
            sx={{
              flex: 1,
              height: '100%',
              backgroundColor: 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end', // 내용이 없으므로 창 제어 버튼만 우측 정렬
              pl: 2,
              pr: 2,
              boxSizing: 'border-box',
            }}
          >
            {/* Windows용 창 조절 버튼 */}
            {!isDarwin && (
              <Box sx={{ display: 'flex', gap: 0.5, WebkitAppRegion: 'no-drag' }}>
                <IconButton size="small" onClick={handleMinimize} sx={{ color: theme.palette.text.secondary }}><Minimize fontSize="small" /></IconButton>
                <IconButton size="small" onClick={handleMaximize} sx={{ color: theme.palette.text.secondary }}><CropSquare fontSize="small" /></IconButton>
                <IconButton size="small" onClick={handleClose} sx={{ color: theme.palette.error.main }}><Close fontSize="small" /></IconButton>
              </Box>
            )}
          </Box>
        </>
      ) : (
        /* 인덱스 뷰: 전체 배경 투명 및 테두리 제거로 타이틀바가 없는 것처럼 보이고 신호등만 공중에 자연스럽게 뜨도록 구성 */
        <Box
          sx={{
            flex: 1,
            height: '100%',
            backgroundColor: 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            pl: isDarwin ? 10.5 : 3,
            pr: 2,
            boxSizing: 'border-box',
          }}
        >
          {/* Windows용 창 조절 버튼 */}
          {!isDarwin && (
            <Box sx={{ display: 'flex', gap: 0.5, WebkitAppRegion: 'no-drag' }}>
              <IconButton size="small" onClick={handleMinimize} sx={{ color: theme.palette.text.secondary }}><Minimize fontSize="small" /></IconButton>
              <IconButton size="small" onClick={handleMaximize} sx={{ color: theme.palette.text.secondary }}><CropSquare fontSize="small" /></IconButton>
              <IconButton size="small" onClick={handleClose} sx={{ color: theme.palette.error.main }}><Close fontSize="small" /></IconButton>
            </Box>
          )}
        </Box>
      )}
    </Box>
  )
}
