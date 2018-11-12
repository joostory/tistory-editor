import React from 'react'
import { render, unmountComponentAtNode } from 'react-dom'
import autobind from 'autobind-decorator'

const plugin = function (editor) {
	const $ = editor.$
	
	const handleButtonClick = () => {
		if (editor.settings && editor.settings.open_file_handler) {
			editor.settings.open_file_handler()
		}
	}
	
	editor.addCommand('file-upload', handleButtonClick)
	editor.addButton('file-upload', {
		cmd: 'file-upload',
		icon: 'image',
		tooltip: '업로드'
	})
}

export default plugin
