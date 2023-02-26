import React, { useEffect } from 'react'
import { useRecoilValue } from 'recoil'
import dayjs from 'dayjs'
import { Chip, IconButton, Box, Divider, Typography, Container, Card, CardMedia, CardContent } from '@mui/material'
import { OpenInBrowser, Edit } from '@mui/icons-material'
import 'highlight.js/styles/atom-one-dark.css'
import { pageview } from '../../../../modules/AnalyticsHelper'
import { currentBlogState } from '../../../../state/currentBlog'
import { currentPostState } from '../../../../state/currentPost'

const styles = {
  root: {
    minHeight: '100vh',
    maxWidth: (theme) => theme.palette.content.maxWidth,
  },
  container: {
    paddingTop: (theme) => theme.spacing(5),
    paddingBottom: (theme) => theme.spacing(5)
  },
  photo: {
    maxWidth: '100%'
  },
  postInfo: {
    marginBottom: (theme) => theme.spacing(3),
    textAlign: 'center'
  },
  cardContent: {
    paddingLeft: (theme) => theme.spacing(5),
    paddingRight: (theme) => theme.spacing(5),
    paddingBottom: (theme) => theme.spacing(3)
  },
  contentContainer: {
    marginBottom: (theme) => theme.spacing(5),
  },
  tag: {
    marginRight: (theme) => theme.spacing(1)
  }
}


function Photo({photo}) {
  const displayPhoto = photo.alt_sizes[0]
  return (
    <CardMedia sx={styles.photo}>
      <img src={displayPhoto.url}
        sx={styles.photo}
      />
    </CardMedia>
  )
}


export default function PhotoContentViewer() {
  const currentBlog = useRecoilValue(currentBlogState)
  const post = useRecoilValue(currentPostState)

  useEffect(() => {
    if (post) {
      pageview(`/blog/${currentBlog.name}/post/${post.id}`, `${post.title}`)
    }
  }, [post])

  return (
    <Box sx={styles.root}>
      <Container disableGutters={true} sx={styles.container}>
        <Card>
          {post.photos.map((photo, index) =>
            <Photo key={index} photo={photo}/>
          )}
          <CardContent sx={styles.cardContent}>
            <Box sx={styles.postInfo}>
              <Typography component='span'>
                {dayjs(post.date).format('YYYY-MM-DD HH:mm')}
              </Typography>
              <IconButton href={post.url} tooltip="브라우저에서 보기" size='small'>
                <OpenInBrowser />
              </IconButton>
            </Box>

            <Typography sx={styles.contentContainer}>
              {post.title}
            </Typography>

            <Box>
              {post.tags.map((item, i) =>
                <Chip key={i} variant='outlined' label={item} sx={styles.tag} />
              )}
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  )
}
