import React from 'react'
import { Drawer, Box, SxProps, Theme } from '@mui/material'
import Header from './Header'
import PostList from './PostList'

const styles = {
  sidebar: {
    width: 300,
    '& .MuiDrawer-paper': {
      width: 300,
      boxSizing: 'border-box'
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
