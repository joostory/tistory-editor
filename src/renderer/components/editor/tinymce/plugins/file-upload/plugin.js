export default function plugin(editor) {
  editor.options.register("open_file_handler", {
    processor: 'function',
    default: () => {}
  })

  const openFileHandler = editor.options.get("open_file_handler")
	
	const handleButtonClick = () => {
    openFileHandler()
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
