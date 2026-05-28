import React, { useEffect } from 'react'
import { useAtomValue } from 'jotai'
import dayjs from 'dayjs'
import { Chip, IconButton, Box, Typography, Container, Card, CardMedia, CardContent, SxProps, Theme } from '@mui/material'
import { OpenInBrowser } from '@mui/icons-material'
import 'highlight.js/styles/atom-one-dark.css'
import { pageview } from '../../../../modules/AnalyticsHelper'
import { currentBlogState } from '../../../../state/currentBlog'
import { currentPostState } from '../../../../state/currentPost'

const styles = {
  root: {
    minHeight: '100vh',
    maxWidth: (theme: any) => theme.palette.content?.maxWidth || '800px',
  } as SxProps<Theme>,
  container: {
    paddingTop: (theme) => theme.spacing(5),
    paddingBottom: (theme) => theme.spacing(5)
  } as SxProps<Theme>,
  photo: {
    maxWidth: '100%'
  } as SxProps<Theme>,
  postInfo: {
    marginBottom: (theme) => theme.spacing(3),
    textAlign: 'center'
  } as SxProps<Theme>,
  cardContent: {
    paddingLeft: (theme) => theme.spacing(5),
    paddingRight: (theme) => theme.spacing(5),
    paddingBottom: (theme) => theme.spacing(3)
  } as SxProps<Theme>,
  contentContainer: {
    marginBottom: (theme) => theme.spacing(5),
  } as SxProps<Theme>,
  tag: {
    marginRight: (theme) => theme.spacing(1)
  } as SxProps<Theme>
}

interface PhotoSize {
  url: string
}

interface PhotoData {
  alt_sizes: PhotoSize[]
}

interface PhotoProps {
  photo: PhotoData
}

function Photo({ photo }: PhotoProps) {
  const displayPhoto = photo.alt_sizes[0]
  return (
    <CardMedia sx={styles.photo}>
      <img 
        src={displayPhoto ? displayPhoto.url : ''}
        style={{ maxWidth: '100%' }}
        alt="Post media"
      />
    </CardMedia>
  )
}

export default function PhotoContentViewer() {
  const currentBlog = useAtomValue(currentBlogState)
  const post = useAtomValue(currentPostState) as any

  useEffect(() => {
    if (post && currentBlog) {
      pageview(`/blog/${currentBlog.name}/post/${post.id}`, `${post.title}`)
    }
  }, [post, currentBlog])

  if (!currentBlog || !post) {
    return null
  }

  const photos: PhotoData[] = post.photos || []
  const tags: string[] = post.tags || []

  return (
    <Box sx={styles.root}>
      <Container disableGutters={true} sx={styles.container}>
        <Card>
          {photos.map((photo, index) =>
            <Photo key={index} photo={photo}/>
          )}
          <CardContent sx={styles.cardContent}>
            <Box sx={styles.postInfo}>
              <Typography component='span'>
                {dayjs(post.date).format('YYYY-MM-DD HH:mm')}
              </Typography>
              <IconButton href={post.url} size='small'>
                <OpenInBrowser />
              </IconButton>
            </Box>

            <Typography sx={styles.contentContainer}>
              {post.title}
            </Typography>

            <Box>
              {tags.map((item, i) =>
                <Chip key={i} variant='outlined' label={item} sx={styles.tag} />
              )}
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  )
}
