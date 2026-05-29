import React from 'react'
import { useAtomValue } from 'jotai'
import { ipcRenderer } from 'electron'
import { useNavigate } from 'react-router-dom'
import {
  List, ListSubheader, Button, Avatar,
  Typography, Paper
} from '@mui/material'
import BlogListItem from '#/renderer/components/index/BlogListItem'
import Providers from '#/renderer/constants/Providers'
import { accountsState } from '#/renderer/state/accounts'
import { Account, Blog, Auth } from '#/renderer/types'

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
    paddingTop: (theme: any) => theme.spacing(2),
    paddingBottom: (theme: any) => theme.spacing(2),
    backgroundColor: (theme: any) => theme.palette.headerBackground,
  },
  logo: {
    display: 'flex',
    width: (theme: any) => theme.spacing(3),
    height: (theme: any) => theme.spacing(3),
    marginRight: (theme: any) => theme.spacing(1)
  },
  title: {
    display: 'flex',
    flexGrow: 1
  }
}

interface ServiceListHeaderProps {
  service: Account;
}

function ServiceListHeader({ service }: ServiceListHeaderProps) {
  const provider = Providers.find((p: any) => p.name == service.auth.provider)
  if (!provider) {
    return <></>
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

interface BlogListProps {
  afterSelect?: () => void;
}

export default function BlogList({ afterSelect }: BlogListProps) {
  const accounts = useAtomValue(accountsState) as Account[]
  const navigate = useNavigate()

  function handleSelectBlog(auth: Auth, blog: Blog) {
    navigate(`/blog/${encodeURIComponent(blog.name)}`)

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
      {accounts.map(account =>
        <List key={account.auth.uuid} subheader={<ServiceListHeader service={account} />}>
          {[...account.blogs].sort((a, b) =>
            a.primary ? -1 : b.primary ? 1 : 0
          ).map(blog =>
            <BlogListItem
              blog={blog}
              key={blog.url}
              onSelect={() => handleSelectBlog(account.auth, blog)}
            />
          )}
        </List>
      )}
    </>
  )
}
