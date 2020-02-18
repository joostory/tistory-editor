import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { List, ListSubheader, Button } from '@material-ui/core'
import BlogListItem from './BlogListItem'
import { selectBlog } from '../../actions'
import { Paper, makeStyles } from '@material-ui/core'

const useStyles = makeStyles(theme => ({
  paper: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 300
  }
}))

function ServiceListHeader({service}) {
  return (
    <ListSubheader>
      {service.user.name} ({service.auth.provider})

      <Button>연결해제</Button>
    </ListSubheader>
  )
}

function AccountList({afterSelect}) {
  const accounts = useSelector(state => state.accounts)
  const dispatch = useDispatch()

  function handleSelectBlog(auth, blog) {
    dispatch(selectBlog(auth, blog))
    if (afterSelect) {
      afterSelect()
    }
  }

  return (
    <>
      {accounts.map(account =>
        <List key={account.auth.uuid} subheader={<ServiceListHeader service={account} />}>
          {account.blogs.sort((a,b) =>
            a.primary? -1 : b.primary? 1 : 0
          ).map(blog =>
            <BlogListItem key={blog.url}
              blog={blog}
              onSelect={e => handleSelectBlog(account.auth, blog)}
            />
          )}
        </List>
      )}
    </>
  )
}

export default function BlogList({afterSelect}) {
  const classes = useStyles()
  const accounts = useSelector(state => state.accounts)

  if (accounts && accounts.length > 0) {
    return <AccountList afterSelect={afterSelect} />

  } else {
    return (
      <Paper className={classes.paper} variant='outlined' square>
        연결된 블로그가 없습니다.
      </Paper>
    )
  }
}
