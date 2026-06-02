import React from 'react'
import { Drawer, Box, SxProps, Theme } from '@mui/material'
import Header from '#/renderer/components/blog/sidebar/Header'
import PostList from '#/renderer/components/blog/sidebar/PostList'

const styles = {
  sidebar: {
    width: 300,
    '& .MuiDrawer-paper': {
      width: 300,
      boxSizing: 'border-box',
      overflow: 'hidden',
      top: '38px',
      height: 'calc(100vh - 38px)'
    }
  } as SxProps<Theme>,
  toolbar: {
    width: 300
  } as SxProps<Theme>
}

interface SidebarProps {
  onSelectBlog: (event: React.MouseEvent<HTMLButtonElement>) => void
}

export default function Sidebar({ onSelectBlog }: SidebarProps) {
  return (
    <Drawer sx={styles.sidebar} open={true} variant='permanent'>
      <Box sx={styles.toolbar}>
        <Header onSelectBlog={onSelectBlog} />
      </Box>
      <PostList />
    </Drawer>
  )
}
