import React, { useState, useEffect } from 'react'
import { ipcRenderer } from 'electron'
import { Snackbar, CssBaseline, Box } from '@mui/material'

import Main from '#/renderer/containers/Main'
import Preference from '#/renderer/components/Preference'
import Titlebar from '#/renderer/components/Titlebar'

export default function App() {
  const [message, setMessage] = useState<string>("")

  function handleReceiveMessage(e: any, message: string) {
    setMessage(message)
  }

  useEffect(() => {
    ipcRenderer.on("receive-message", handleReceiveMessage)
    
    return () => {
      ipcRenderer.removeListener("receive-message", handleReceiveMessage)
    }
  }, [])

  return (
    <>
      <CssBaseline />
      <Titlebar />
      
      <Box sx={{ pt: 0, height: '100vh', display: 'flex', flexDirection: 'column', boxSizing: 'border-box', overflowY: 'auto' }}>
        <Main />
      </Box>

      {message &&
        <Snackbar
          open={true}
          message={message}
          autoHideDuration={3000}
          onClose={() => setMessage('')}
        />
      }

      <Preference />
    </>
  )
}
