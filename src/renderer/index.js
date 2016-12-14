import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import {ipcRenderer} from 'electron'

import App from './containers/App'
import configureStore from './store/configureStore'
import { fetchUser, fetchBlogs, receiveUser, receiveBlogs } from './actions'

// import '../css/base.css'
import '../css/editor.css'

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
		<App />
	</Provider>,
	document.getElementById('root')
)
