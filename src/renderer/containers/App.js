import React, { Component, useState, useEffect } from 'react'
import { ipcRenderer } from 'electron'
import { Snackbar } from '@material-ui/core'

import Main from './Main'
import Preference from '../components/Preference'

export default function App(props) {

	const [message, setMessage] = useState("");

	function handleReceiveMessage(e, message) {
		setMessage(message);
	}

	useEffect(() => {
		ipcRenderer.on("receive-message", handleReceiveMessage)
		
		return () => {
			ipcRenderer.removeListener("receive-message", handleReceiveMessage)
		}
	});
	//
	return (
		<>
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

