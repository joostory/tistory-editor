import React from 'react'
import { createRoot } from 'react-dom/client'

import './styles/index.scss'
import ThemeApp from './containers/ThemeApp'
import IpcEventReceiver from './containers/IpcEventReceiver'

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
