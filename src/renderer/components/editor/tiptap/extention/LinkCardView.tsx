import React, { useState } from 'react'
import { NodeViewWrapper, NodeViewProps } from '@tiptap/react'
import { Box, IconButton } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'

export default function LinkCardView({ node, getPos, editor }: NodeViewProps) {
  const [isHovered, setIsHovered] = useState(false)
  const { url, title, description, siteName, image } = node.attrs

  const hasImage = !!image

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (typeof getPos === 'function') {
      const pos = getPos()
      editor.commands.deleteRange({ from: pos, to: pos + node.nodeSize })
    }
  }

  return (
    <NodeViewWrapper
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ position: 'relative', display: 'block' }}
    >
      {/* X 삭제 버튼 (Hover 시에만 노출) */}
      {isHovered && (
        <IconButton
          onClick={handleDelete}
          size="small"
          sx={{
            position: 'absolute',
            top: -8,
            right: -8,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            color: '#ffffff',
            zIndex: 10,
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: 'rgba(239, 68, 68, 0.9)', // hover 시 붉은색 피드백
              transform: 'scale(1.1)',
            },
          }}
        >
          <CloseIcon sx={{ fontSize: 16 }} />
        </IconButton>
      )}

      {/* 카드 링크 영역 */}
      <Box
        component="a"
        href={url || '#'}
        target="_blank"
        rel="noopener noreferrer"
        sx={{
          display: 'flex',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          overflow: 'hidden',
          margin: '16px 0',
          fontFamily: 'sans-serif',
          textDecoration: 'none',
          color: 'inherit',
          cursor: 'pointer',
          transition: 'box-shadow 0.2s, transform 0.2s',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          },
        }}
      >
        {/* 콘텐츠 정보 */}
        <Box
          sx={{
            flex: 1,
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            minWidth: 0,
          }}
        >
          <Box
            sx={{
              fontWeight: 'bold',
              fontSize: '16px',
              marginBottom: '8px',
              color: '#1a202c',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {title || url}
          </Box>
          
          <Box
            sx={{
              fontSize: '14px',
              color: '#4a5568',
              marginBottom: '8px',
              lineHeight: 1.4,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {description || ''}
          </Box>
          
          <Box
            sx={{
              fontSize: '12px',
              color: '#718096',
            }}
          >
            {siteName || ''}
          </Box>
        </Box>

        {/* 이미지 영역 */}
        {hasImage && (
          <Box
            sx={{
              width: '150px',
              backgroundImage: `url('${image}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              flexShrink: 0,
            }}
          />
        )}
      </Box>
    </NodeViewWrapper>
  )
}
