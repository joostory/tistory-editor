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
	editor.ui.registry.addButton('file-upload', {
		icon: 'image',
    tooltip: '업로드',
    onAction: () => {
      editor.execCommand('file-upload')
    }
	})
}

export default plugin
