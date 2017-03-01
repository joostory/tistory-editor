import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { ipcRenderer } from 'electron'
import injectTapEventPlugin from 'react-tap-event-plugin'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import App from './containers/App'
import configureStore from './store/configureStore'
import { registIpcEvent } from './actions/ipc-event'

injectTapEventPlugin()
const store = configureStore()
registIpcEvent(store)

render (
	<Provider store={store}>
		<MuiThemeProvider>
			<App />
		</MuiThemeProvider>
	</Provider>,
	document.getElementById('root')
)
