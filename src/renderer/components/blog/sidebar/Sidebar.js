import React from 'react'
import { Drawer, AppBar, Box } from '@mui/material'
import Header from './Header'
import PostList from './PostList'


const styles = {
  sidebar: {
    width: 300
  },
  toolbar: {
    width: 300
  }
}

export default function Sidebar({onSelectBlog}) {
	return (
		<Drawer sx={styles.sidebar} open={true} variant='permanent'>
      <Box color='default' sx={styles.toolbar}>
        <Header onSelectBlog={onSelectBlog} />
      </Box>
			<PostList />
		</Drawer>
	)
}
