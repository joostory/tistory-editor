import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { ipcRenderer } from 'electron'
import injectTapEventPlugin from 'react-tap-event-plugin'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import App from './containers/App'
import configureStore from './store/configureStore'
import { fetchUser, fetchBlogs, receiveUser, receiveBlogs } from './actions'

import 'material-design-lite/material.css'
import '../css/editor.css'

injectTapEventPlugin()
const store = configureStore()
fetchUser()
fetchBlogs()
ipcRenderer.on("receive-user", (e, user) => {
	console.log("receive-user", user)
	store.dispatch(receiveUser(user))
})
ipcRenderer.on("receive-blogs", (e, user) => {
	console.log("receive-blogs", user)
	store.dispatch(receiveBlogs(user))
})

render (
	<Provider store={store}>
		<MuiThemeProvider>
			<App />
		</MuiThemeProvider>
	</Provider>,
	document.getElementById('root')
)
