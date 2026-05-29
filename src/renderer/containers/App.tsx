import React, { useState, useEffect } from 'react'
import { ipcRenderer } from 'electron'
import { Snackbar, CssBaseline } from '@mui/material'

import Main from '#/renderer/containers/Main'
import Preference from '#/renderer/components/Preference'

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
      
      <Main />

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
