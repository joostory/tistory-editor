import React, { useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import dateformat from 'dateformat'
import { Chip, IconButton, CircularProgress } from '@material-ui/core'
import { OpenInBrowser, Edit } from '@material-ui/icons'
import highlightjs from 'highlight.js'
import 'highlight.js/styles/atom-one-dark.css'
import * as ContentHelper from '../../../modules/ContentHelper'
import { pageview } from '../../../modules/AnalyticsHelper'
import { ipcRenderer } from 'electron'

export default function TistoryContentViewer({onRequestEditPost}) {
  const currentAuth = useSelector(state => state.currentAuth)
  const currentBlog = useSelector(state => state.currentBlog)
  const post = useSelector(state => state.currentPost)
  const viewerContent = useRef(null)

  useEffect(() => {
    if (post) {
      pageview(`/blog/${currentBlog.name}/post/${post.id}`, `${post.title}`)
      
      if (post.fetched) {
        Array.prototype.map.call(viewerContent.current.getElementsByTagName("pre"), pre => {
          highlightjs.highlightBlock(pre)
        })
      } else {
        ipcRenderer.send("fetch-content", currentAuth.uuid, currentBlog.name, post.id)
      }
    }

  }, [post])

  let buttonStyle = {
    verticalAlign:'middle',
    width: '24px',
    height: '24px',
    padding: 0,
    marginLeft: '5px'
  }

  return (
    <div className='content_wrap'>
      <div className='viewer'>
        <div className='viewer_header'>
          <h1 className='viewer_title'>{post.title}</h1>
          <div className='viewer_info'>
            <span>{dateformat(new Date(post.date), 'yyyy-mm-dd HH:MM')}</span>
            <IconButton href={post.url} tooltip="브라우저에서 보기" style={buttonStyle}><OpenInBrowser /></IconButton>
            <IconButton onClick={onRequestEditPost} tooltip="수정하기" style={buttonStyle}><Edit /></IconButton>
          </div>
        </div>

        {!post.fetched &&
          <CircularProgress />
        }

        <div ref={viewerContent}
          className="viewer_content content"
          dangerouslySetInnerHTML={{__html: ContentHelper.makeUrlBase(post.content)}}
        />

        <div className="viewer_tags">
          {post.tags.map((item, i) =>
            <Chip key={i} variant='outlined' label={item} className={'tag'} />
          )}
        </div>

      </div>
    </div>
  )
}
