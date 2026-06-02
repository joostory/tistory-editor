import React from 'react'
import { useAtomValue } from 'jotai'
import TumblrContentViewer from '#/renderer/components/blog/content/TumblrContentViewer'
import { Box, Typography, SxProps, Theme } from '@mui/material'
import { currentAuthState } from '#/renderer/state/currentBlog'
import { currentPostState } from '#/renderer/state/currentPost'

const styles = {
  container: {
    position: 'fixed',
    left: 300,
    right: 0,
    top: 0,
    bottom: 0,
    pt: '38px', // 콘텐츠의 내용물 시작은 타이틀바 아래에서 시작하되
    overflow: 'auto',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'start'
  } as SxProps<Theme>,
  emtpyMessage: {
    height: 'calc(100vh - 38px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  } as SxProps<Theme>
}

function EmptyContent() {
  return (
    <Typography sx={styles.emtpyMessage} color='textSecondary'>
      Editor
    </Typography>
  )
}

interface ContentProps {
  onRequestEditPost: () => void
}

import { isEditorOpenState } from '#/renderer/state/editorStatus'

function ContentViewer({ onRequestEditPost }: ContentProps) {
  const post = useAtomValue(currentPostState)
  const currentAuth = useAtomValue(currentAuthState)

  if (!post) {
    return <EmptyContent />
  }

  if (currentAuth && currentAuth.provider === 'tumblr') {
    return <TumblrContentViewer onRequestEditPost={onRequestEditPost} />
  } else {
    return <EmptyContent />
  }
}

export default function Content({ onRequestEditPost }: ContentProps) {
  const isEditorOpen = useAtomValue(isEditorOpenState)

  return (
    <Box sx={{
      ...styles.container,
      overflow: isEditorOpen ? 'hidden' : 'auto' // 에디터가 열려있는 동안에는 본문 영역 스크롤바를 숨겨 뒤로 비쳐 보이는 문제를 완벽 예방
    }}>
      <ContentViewer onRequestEditPost={onRequestEditPost} />
    </Box>
  )
}
