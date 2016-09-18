import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import App from './containers/App'
import configureStore from './store/configureStore'
import { fetchLocalPosts } from './actions'

import '../css/base.css'
import '../css/editor.css'
import '../css/codemirror-material-theme.css'

const store = configureStore()

store.dispatch(fetchLocalPosts());

render (
	<Provider store={store}>
		<App />
	</Provider>,
	document.getElementById('root')
)
