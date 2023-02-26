import React from 'react'
import { createRoot } from 'react-dom/client'
import { RecoilRoot } from 'recoil'

import './styles/index.scss'
import '../css/content.css'
import '../css/tistory-content.css'
import ThemeApp from './containers/ThemeApp'
import IpcEventReceiver from './containers/IpcEventReceiver'

const root = createRoot(document.getElementById('root'))
root.render(
  <RecoilRoot>
    <IpcEventReceiver />
    <ThemeApp />
  </RecoilRoot>
)
