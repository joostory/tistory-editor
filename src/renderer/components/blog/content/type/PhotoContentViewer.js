import React, { useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import dateformat from 'dateformat'
import { Chip, IconButton, Box, Divider, Typography, makeStyles, Container, Card, CardMedia, CardContent } from '@material-ui/core'
import { OpenInBrowser, Edit } from '@material-ui/icons'
import 'highlight.js/styles/atom-one-dark.css'
import { pageview } from '../../../../modules/AnalyticsHelper'

const useStyles = makeStyles(theme => ({
  root: {
    backgroundColor: '#fff',
    minHeight: '100vh'
  },
  container: {
    paddingTop: theme.spacing(5),
    paddingBottom: theme.spacing(5)
  },
  photo: {
    maxWidth: '100%'
  },
  postInfo: {
    marginBottom: theme.spacing(3),
    textAlign: 'center'
  },
  contentContainer: {
    marginBottom: theme.spacing(5)
  },
  tag: {
    marginRight: theme.spacing(1)
  }
}))


function Photo({photo}) {
  const classes = useStyles()
  const displayPhoto = photo.alt_sizes[1]
  return (
    <CardMedia className={classes.photo}>
      <img src={displayPhoto.url}
        className={classes.photo}
      />
    </CardMedia>
  )
}


export default function PhotoContentViewer() {
  const classes = useStyles()
  const currentBlog = useSelector(state => state.currentBlog)
  const post = useSelector(state => state.currentPost)

  useEffect(() => {
    if (post) {
      pageview(`/blog/${currentBlog.name}/post/${post.id}`, `${post.title}`)
    }
  }, [post])

  return (
    <Box className={classes.root}>
      <Container maxWidth='sm' disableGutters={true} className={classes.container}>
        <Card>
          {post.photos.map((photo, index) =>
            <Photo key={index} photo={photo}/>
          )}
          <CardContent>
            <Box className={classes.postInfo}>
              <Typography component='span'>
                {dateformat(new Date(post.date), 'yyyy-mm-dd HH:MM')}
              </Typography>
              <IconButton href={post.url} tooltip="브라우저에서 보기" size='small'>
                <OpenInBrowser />
              </IconButton>
            </Box>

            <Typography className={classes.contentContainer}>
              {post.title}
            </Typography>

            <Box>
              {post.tags.map((item, i) =>
                <Chip key={i} variant='outlined' label={item} className={classes.tag} />
              )}
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  )
}
