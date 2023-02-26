import React from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { RecoilRoot } from 'recoil'

import configureStore from './store/configureStore'
import { registIpcEvent } from './actions/ipc-event'
import './styles/index.scss'
import '../css/content.css'
import '../css/tistory-content.css'
import ThemeApp from './containers/ThemeApp'
import IpcEventReceiver from './containers/IpcEventReceiver'

const store = configureStore()
registIpcEvent(store)

const root = createRoot(document.getElementById('root'))
root.render(
  <Provider store={store}>
    <RecoilRoot>
      <IpcEventReceiver />
      <ThemeApp />
    </RecoilRoot>
  </Provider>
)
