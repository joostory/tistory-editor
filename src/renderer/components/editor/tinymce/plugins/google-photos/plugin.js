const plugin = function(editor) {
	const $ = editor.$
  const settings = editor.settings.google_photos
  if (!settings.open_handler) {
    return
  }
	
	editor.addCommand('google-photos', settings.open_handler)
	editor.addButton('google-photos', {
		cmd: 'google-photos',
		icon: 'google-photos',
		tooltip: 'Google Photos'
	})
}

export default plugin
