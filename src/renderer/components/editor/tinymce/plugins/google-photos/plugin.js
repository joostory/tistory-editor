import googlePhotosLogo from '../../../../../images/google-photos-logo.png'

const plugin = function(editor) {
  editor.options.register("google_photos", {
    processor: 'object'
  })

  const settings = editor.options.get("google_photos")
  if (!settings.open_handler) {
    return
  }


	
  editor.addCommand('google-photos', settings.open_handler)
  editor.ui.registry.addIcon('google-photos', `<img src="${googlePhotosLogo}">`)
  
	editor.ui.registry.addButton('google-photos', {
		icon: 'google-photos',
    tooltip: 'Google Photos',
    onAction: () => {
      editor.execCommand('google-photos')
    }
	})
}

export default plugin
