import React from 'react'
import { createRoot } from 'react-dom/client'

import './styles/index.scss'
import '../css/content.css'
import '../css/tistory-content.css'
import ThemeApp from './containers/ThemeApp'
import IpcEventReceiver from './containers/IpcEventReceiver'

const root = createRoot(document.getElementById('root'))
root.render(
  <>
    <IpcEventReceiver />
    <ThemeApp />
  </>
)
