import React, { useEffect } from 'react'
import { ipcRenderer } from 'electron'
import { useRecoilState } from 'recoil'
import { preferencesState } from 'state/preferences'


export default function IpcEventReceiver() {
  const [preferences, setPreferences] = useRecoilState(preferencesState)

  useEffect(() => {
    ipcRenderer.send('fetch-initial-data')
    ipcRenderer.send("fetch-preferences")

    ipcRenderer.on("receive-preferences", (e, data) => {
      console.log('Renderer.receive: receive-preferences', data)
      setPreferences(data)
    })
  }, [])

  return <></>
}
