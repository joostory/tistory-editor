import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import {ipcRenderer} from 'electron'

import App from './containers/App'
import configureStore from './store/configureStore'
import { fetchInfo, receiveInfo } from './actions'

// import '../css/base.css'
import '../css/editor.css'
import '../css/codemirror.min.css'
import '../css/codemirror-material-theme.css'
import '../../node_modules/codemirror/addon/dialog/dialog.css'

const store = configureStore()
fetchInfo()
ipcRenderer.on("receive-info", (e, info) => {
	console.log("receive-info", info)
	store.dispatch(receiveInfo(info))
})

render (
	<Provider store={store}>
		<App />
	</Provider>,
	document.getElementById('root')
)
