import React from 'react'
import { useRecoilValue, useSetRecoilState } from 'recoil'
import { ipcRenderer } from 'electron'
import {
  List, ListSubheader, Button, Avatar,
  Typography, Paper
} from '@mui/material'
import BlogListItem from './BlogListItem'
import Providers from '../../constants/Providers'
import { accountsState } from '../../state/accounts'
import { currentAuthState, currentBlogCategoriesState, currentBlogState, INITIAL_CATEGORIES, INITIAL_CURRENT_AUTH, INITIAL_CURRENT_BLOG } from '../../state/currentBlog'
import { INITIAL_POSTS, postsInitializedState, postsLockState, postsState } from '../../state/posts'
import { currentPostState, INITIAL_CURRENT_POST } from '../../state/currentPost'

const styles = {
  paper: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 300
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    paddingTop:(theme) => theme.spacing(2),
    paddingBottom:(theme) => theme.spacing(2),
    backgroundColor:(theme) => theme.palette.headerBackground,
  },
  logo: {
    display: 'flex',
    width:(theme) => theme.spacing(3),
    height:(theme) => theme.spacing(3),
    marginRight:(theme) => theme.spacing(1)
  },
  title: {
    display: 'flex',
    flexGrow: 1
  }
}

function ServiceListHeader({service}) {
  const provider = Providers.find(p => p.name == service.auth.provider)
  if (!provider) {
    return (
      <></>
    )
  }

  function handleDisconnect() {
    if (confirm(`${provider.label} 서비스에 연결된 ${service.user.name} 계정을 제거하시겠습니까?`)) {
      ipcRenderer.send('disconnect-auth', service.auth.uuid)
    }
  }

  return (
    <ListSubheader sx={styles.header}>
      <Avatar src={provider.logo} sx={styles.logo} />
      <Typography component='div' sx={styles.title}>
        {service.user.name}
      </Typography>
      <Button variant='text' color='secondary' size='small' onClick={handleDisconnect}>
        연결해제
      </Button>
    </ListSubheader>
  )
}

export default function BlogList({afterSelect}) {
  const accounts = useRecoilValue(accountsState)
  const setCurrentAuth = useSetRecoilState(currentAuthState)
  const setCurrentBlog = useSetRecoilState(currentBlogState)
  const setPosts = useSetRecoilState(postsState)
  const setPostsInitialized = useSetRecoilState(postsInitializedState)
  const setPostsLock = useSetRecoilState(postsLockState)
  const setCurrentBlogCategories = useSetRecoilState(currentBlogCategoriesState)
  const setCurrentPost = useSetRecoilState(currentPostState)

  function handleSelectBlog(auth, blog) {
    setCurrentAuth(auth)
    setCurrentBlog(blog)

    setCurrentBlogCategories(INITIAL_CATEGORIES)
    setPosts(INITIAL_POSTS)
    setPostsInitialized(false)
    setPostsLock(false)
    setCurrentPost(INITIAL_CURRENT_POST)
    
    if (afterSelect) {
      afterSelect()
    }
  }

  if (!accounts || accounts.length == 0) {
    return (
      <Paper sx={styles.paper} variant='outlined' square>
        연결된 블로그가 없습니다.
      </Paper>
    )
  }

  return (
    <>
      {accounts.filter(it => it.auth.provider != 'tistory').map(account =>
        <List key={account.auth.uuid} subheader={<ServiceListHeader service={account} />}>
          {[...account.blogs].sort((a,b) =>
            a.primary? -1 : b.primary? 1 : 0
          ).map(blog =>
            <li key={blog.url}>
              <BlogListItem
                blog={blog}
                onSelect={e => handleSelectBlog(account.auth, blog)}
              />
            </li>
          )}
        </List>
      )}
    </>
  )
}
