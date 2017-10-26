import React from 'react'
import { render, unmountComponentAtNode } from 'react-dom'
import autobind from 'autobind-decorator'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import GooglePhotosApp from './GooglePhotosApp'

const plugin = (editor, pluginUrl) => {
	const $ = editor.$
	
	const handleButtonClick = () => {
		let win = editor.windowManager.open({
			title: 'Google Photos',
			items: [{
				type: 'container',
				html: '<div class="mce-google-photos"></div>'
			}],
			buttons: []
		})

		win.statusbar.remove()
		const dialogContainer = win.$el.find(".mce-google-photos")[0]
	
		render(
			<MuiThemeProvider>
				<GooglePhotosApp editor={editor} onClose={() => {
					win.close()
				}} />
			</MuiThemeProvider>,
			dialogContainer
		)
	
		win.on("close", (e) => {
			unmountComponentAtNode(dialogContainer)
		})
	}
	
	editor.addCommand('google-photos', handleButtonClick)
	editor.addButton('google-photos', {
		cmd: 'google-photos',
		icon: 'image',
		tooltip: 'Google Photos'
	})
}

export default plugin
