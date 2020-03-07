import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'

import configureStore from './store/configureStore'
import { registIpcEvent } from './actions/ipc-event'
import './styles/index.scss'
import '../css/content.css'
import '../css/tistory-content.css'
import ThemeApp from './containers/ThemeApp'

const store = configureStore()
registIpcEvent(store)

render (
  <Provider store={store}>
    <ThemeApp />
  </Provider>,
  document.getElementById('root')
)
