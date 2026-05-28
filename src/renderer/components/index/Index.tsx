import React, { useEffect } from 'react'
import { pageview } from '../../modules/AnalyticsHelper'
import {
  Container, Typography
} from '@mui/material'
import BlogList from './BlogList'
import AuthButton from './AuthButton'

const styles = {
  root: {
    marginTop: (theme: any) => theme.spacing(5),
    marginBottom: (theme: any) => theme.spacing(5)
  },
  title: {
    textAlign: 'center',
    padding: (theme: any) => theme.spacing(5)
  }
}

export default function Index() {
  useEffect(() => {
    pageview('/index', 'Index')
  }, [])

  return (
    <Container fixed sx={styles.root} maxWidth='sm'>
      <Typography sx={styles.title} variant='h2' component='h1'>
        Editor
      </Typography>
      
      <BlogList />

      <AuthButton />
    </Container>
  )
}
