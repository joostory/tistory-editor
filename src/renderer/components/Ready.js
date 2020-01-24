import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { ipcRenderer } from 'electron'

import { Button } from '@material-ui/core'

import { pageview } from '../modules/AnalyticsHelper'
import Loading from '../components/Loading'

export default function Ready() {
  const status = useSelector(state => state.status)

  function handleRequestAuth() {
		ipcRenderer.send('request-auth')
	}

  useEffect(() => {
    pageview('/ready', '인증대기')
    return () => {}
  })

  return (
    <div className='container'>
      { status.fetchUser &&
        <Loading />
      }
      { !status.fetchUser &&
        <div className='ready'>
          <h1><span className="tumblr">Tumblr</span> Editor</h1>
          <Button className="btn btn_tumblr" variant="contained" onClick={handleRequestAuth}>
            텀블러 인증
          </Button>
        </div>
      }
    </div>
  )
}
