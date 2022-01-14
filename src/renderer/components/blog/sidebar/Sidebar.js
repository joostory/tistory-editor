import React from 'react'
import { Drawer, AppBar, Box } from '@mui/material'
import { makeStyles } from '@mui/styles'
import Header from './Header'
import PostList from './PostList'


const useStyles = makeStyles(theme => ({
  sidebar: {
    width: 300
  },
  toolbar: {
    position: 'fixed',
    left: 0,
    width: 300
  }
}))

export default function Sidebar({onSelectBlog}) {
  const classes = useStyles()

	return (
		<Drawer className={classes.sidebar} open={true} variant='permanent' classes={{paper: classes.sidebar}}>
      <Box color='default' className={classes.toolbar}>
        <Header onSelectBlog={onSelectBlog} />
      </Box>
			<PostList />
		</Drawer>
	)
}
