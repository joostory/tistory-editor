import React, { useEffect } from 'react'
import { pageview } from '../../modules/AnalyticsHelper'
import {
  Container, Typography
} from '@mui/material'
import { makeStyles } from '@mui/styles'
import BlogList from './BlogList'
import AuthButton from './AuthButton'


const useStyle = makeStyles(theme => ({
  root: {
    maxWidth: 600,
    marginTop: theme.spacing(5),
    marginBottom: theme.spacing(5)
  },
  title: {
    textAlign: 'center',
    padding: theme.spacing(5)
  }
}))


export default function Index() {
  const classes = useStyle()

	useEffect(() => {
		pageview('/index', 'Index')
	}, [])

	return (
    <Container fixed className={classes.root}>
      <Typography className={classes.title} variant='h2' component='h1'>
        Editor
      </Typography>
      
      <BlogList />

      <AuthButton />
    </Container>
	)
}
