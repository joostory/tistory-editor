import React, { useState, useEffect } from 'react'
import { ipcRenderer } from 'electron'
import { Snackbar, CssBaseline } from '@mui/material'

import Main from './Main'
import Preference from '../components/Preference'

export default function App() {

	const [message, setMessage] = useState("");

	function handleReceiveMessage(e, message) {
		setMessage(message);
	}

	useEffect(() => {
		ipcRenderer.on("receive-message", handleReceiveMessage)
		
		return () => {
			ipcRenderer.removeListener("receive-message", handleReceiveMessage)
		}
	}, []);
	//
	return (
		<>
      <CssBaseline />
      
			<Main />

			{message &&
				<Snackbar
					open={true}
					message={message}
					autoHideDuration={3000}
					onClose={e => setMessage('')}
				/>
			}

			<Preference />
		</>
	);
}

