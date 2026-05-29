import React, { useMemo } from 'react'
import { useAtomValue } from 'jotai'
import dayjs from 'dayjs'
import { ListItem, ListItemButton, ListItemText, Typography, Box, SxProps, Theme } from '@mui/material'
import { DraftsOutlined, PhotoOutlined, CommentOutlined } from '@mui/icons-material'
import { Post } from '#/renderer/types'
import { isPublished } from '#/renderer/constants/PostState'
import { currentBlogCategoriesState } from '#/renderer/state/currentBlog'

const styles = {
  info: {
    display: 'block',
    fontSize: '0.9em'
  } as SxProps<Theme>,
  icon: {
    marginLeft: (theme) => theme.spacing(1)
  } as SxProps<Theme>
}

interface HelperProps {
  post: Post & { date?: string | number | Date; state?: string; type?: string }
}

function PostTitle({ post }: HelperProps) {
  return (
    <Typography noWrap={true}>
      {post.title}
    </Typography>
  )
}

function PostInfo({ post }: HelperProps) {
  const categories = useAtomValue(currentBlogCategoriesState)
  
  const category = useMemo(() => {
    if (categories && post.categoryId) {
      return categories.find((c: any) => c.id == post.categoryId)
    }
    return null
  }, [categories, post])

  return (
    <>
      <Typography component='span' sx={styles.info}>
        {dayjs(post.date).format('YYYY-MM-DD HH:mm')}
      </Typography>

      {category &&
        <Typography component='span' sx={styles.info} color='secondary'>
          {category.name}
        </Typography>
      }
    </>
  )
}

function PostIcon({ post }: HelperProps) {
  if (!isPublished(post.state || '')) {
    return <DraftsOutlined />
  }

  switch (post.type) {
    case 'photo':
      return <PhotoOutlined />
    case 'link':
      return <CommentOutlined />
    default:
      return null
  }
}

interface PostListItemProps {
  key?: any
  post: Post
  selected: boolean
  onSelect: (post: Post) => void
}

export default function PostListItem({ post, selected, onSelect }: PostListItemProps) {
  return (
    <ListItem disablePadding>
      <ListItemButton selected={selected} onClick={() => { onSelect(post) }}>
        <ListItemText
          primary={<PostTitle post={post} />}
          secondary={<PostInfo post={post} />}
        />

        <Box sx={styles.icon}>
          <PostIcon post={post} />
        </Box>
      </ListItemButton>
    </ListItem>
  )
}
