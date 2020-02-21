import React from 'react'
import { Drawer, makeStyles, AppBar, Box } from '@material-ui/core'
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
