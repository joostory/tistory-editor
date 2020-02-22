import React, { useMemo } from 'react'
import { useSelector } from 'react-redux'
import dateformat from 'dateformat'
import { ListItem, ListItemText, Typography, makeStyles } from '@material-ui/core'
import { Drafts } from '@material-ui/icons'
import { isPublished } from '../../../constants/PostState'

const useStyles = makeStyles(theme => ({
  info: {
    display: 'block',
    fontSize: '0.9em'
  }
}))

function PostTitle({post}) {
  return (
    <Typography noWrap={true}>
      {post.title}
    </Typography>
  )
}

function PostInfo({post}) {
  const classes = useStyles()
  const currentBlog = useSelector(state => state.currentBlog)
  const category = useMemo(() => {
    if (currentBlog.categories && post.categoryId) {
      return currentBlog.categories.find(c => c.id == post.categoryId)
    }
  }, [currentBlog, post])

  return (
    <>
      <Typography component='span' className={classes.info}>
        {dateformat(new Date(post.date), 'yyyy-mm-dd HH:MM')}
      </Typography>
      
      {category &&
        <Typography component='span' className={classes.info} color='secondary'>
          {category.name}
        </Typography>
      }
    </>
  )
}

export default function PostListItem({ post, selected, onSelect }) {
	return (
		<ListItem button selected={selected} onClick={() => {onSelect(post)}}>
			<ListItemText
				primary={<PostTitle post={post} />}
				secondary={<PostInfo post={post} />}
			/>

			{!isPublished(post.state) && <Drafts />}
		</ListItem>
	)
}

