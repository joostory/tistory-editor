import React from 'react'
import { render, unmountComponentAtNode } from 'react-dom'
import autobind from 'autobind-decorator'
import { ipcRenderer } from 'electron'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import GooglePhotosApp from '../../../../components/editor/plugins/google-photos/GooglePhotosApp'

const plugin = (editor, pluginUrl) => {
	const $ = editor.$
	const settings = editor.settings.google_photos
	
	const handleButtonClick = () => {
		let win = editor.windowManager.open({
			title: 'Google Photos',
			items: [{
				type: 'container',
				html: '<div class="plugin-google-photos"></div>'
			}],
			buttons: []
		})

		win.statusbar.remove()
		const dialogContainer = win.$el.find(".plugin-google-photos")[0]
	
		render(
			<MuiThemeProvider>
				<GooglePhotosApp onSelectImage={(url, filename) => {
					if (settings && settings.add_handler) {
						settings.add_handler(url, filename)
					} else {
						editor.undoManager.transact(() => {
							editor.insertContent(`<img id="__photos_new" src="${url}" data-photos-src="${url}">`)
							let $img = editor.$('#__photos_new')
							$img.removeAttr('id')
							$img.on('load', e => {
								editor.nodeChanged()
								$img.off('load')
							})
						})
					}
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
		icon: 'google-photos',
		tooltip: 'Google Photos'
	})
}

export default plugin
