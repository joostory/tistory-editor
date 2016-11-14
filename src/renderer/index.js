import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import App from './containers/App'
import configureStore from './store/configureStore'
import { fetchAuth } from './actions'

import '../css/base.css'
import '../css/editor.css'
import '../css/codemirror.min.css'
import '../css/codemirror-material-theme.css'
import '../../node_modules/codemirror/addon/dialog/dialog.css'

const store = configureStore()

store.dispatch(fetchAuth());

render (
	<Provider store={store}>
		<App />
	</Provider>,
	document.getElementById('root')
)
