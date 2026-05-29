import React from 'react'
import { createRoot } from 'react-dom/client'

import '#/renderer/styles/index.scss'
import ThemeApp from '#/renderer/containers/ThemeApp'
import IpcEventReceiver from '#/renderer/containers/IpcEventReceiver'

const container = document.getElementById('root')
if (container) {
  const root = createRoot(container)
  root.render(
    <>
      <IpcEventReceiver />
      <ThemeApp />
    </>
  )
}
