import React, { useMemo } from 'react'
import { useSelector } from 'react-redux'
import dayjs from 'dayjs'
import { ListItem, ListItemText, Typography, Box } from '@mui/material'
import { DraftsOutlined, PhotoOutlined, CommentOutlined } from '@mui/icons-material'
import { isPublished } from '../../../constants/PostState'

const styles = {
  info: {
    display: 'block',
    fontSize: '0.9em'
  },
  icon: {
    marginLeft:(theme) => theme.spacing(1)
  }
}

function PostTitle({post}) {
  return (
    <Typography noWrap={true}>
      {post.title}
    </Typography>
  )
}

function PostInfo({post}) {
  const currentBlog = useSelector(state => state.currentBlog)
  const category = useMemo(() => {
    if (currentBlog.categories && post.categoryId) {
      return currentBlog.categories.find(c => c.id == post.categoryId)
    }
  }, [currentBlog, post])

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

function PostIcon({post}) {
  if (!isPublished(post.state)) {
    return <DraftsOutlined />
  }

  switch(post.type) {
    case 'photo':
      return <PhotoOutlined />
    case 'link':
      return <CommentOutlined />
    default:
      return null
  }
}

export default function PostListItem({ post, selected, onSelect }) {
	return (
		<ListItem button selected={selected} onClick={() => {onSelect(post)}}>
			<ListItemText
				primary={<PostTitle post={post} />}
				secondary={<PostInfo post={post} />}
			/>

      <Box sx={styles.icon}>
        <PostIcon post={post} />
      </Box>
		</ListItem>
	)
}

