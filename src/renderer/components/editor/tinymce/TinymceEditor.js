import React, { useState, useEffect, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { ipcRenderer, clipboard } from 'electron'
import OpengraphFetcher from 'opengraph-fetcher'

import tinymce from 'tinymce'
import { Editor } from '@tinymce/tinymce-react'

import 'tinymce-plugin-opengraph'
import 'tinymce-plugin-codeblock'
import './plugins/google-photos'
import './plugins/file-upload'

import GooglePhotosDialog from '../plugins/google-photos/GooglePhotosDialog'
import { makeThumbnail } from '../../../modules/ThumbnailHelper'

export default function TinymceEditor({ value, onImageHandler, onOpenFile, onChange }) {
  const currentAuth = useSelector(state => state.currentAuth)
  const currentBlog = useSelector(state => state.currentBlog)
  const [openGooglePhotos, setOpenGooglePhotos] = useState(false)
  const imageUploadEnabled = useMemo(() => currentAuth.provider == 'tistory', [currentAuth])

  const tinymcePlugins = useMemo(() => {
    if (imageUploadEnabled) {
      return 'link table textcolor hr lists paste codeblock opengraph google-photos file-upload autoresize searchreplace'
    } else {
      return 'link table textcolor hr lists paste codeblock opengraph autoresize searchreplace'
    }
  }, [imageUploadEnabled])
  const tinymceToolbar = useMemo(() => {
    if (imageUploadEnabled) {
      return 'formatselect bold italic link inlinecode | alignleft aligncenter alignright | bullist numlist | blockquote codeblock google-photos file-upload opengraph hr removeformat'
    } else {
      return 'formatselect bold italic link inlinecode | alignleft aligncenter alignright | bullist numlist | blockquote codeblock opengraph hr removeformat'
    }
  }, [imageUploadEnabled])

  function handleFinishUploadFile(e, fileUrl) {
		console.log("finishUploadFile", fileUrl)
		const editor = tinymce.activeEditor
		editor.execCommand('mceInsertContent', false, '<img id="__photos_new" src="'+fileUrl+'" />');
		let $img = editor.$('#__photos_new')
		$img.removeAttr('id')
		$img.on('load', e => {
			editor.nodeChanged()
			$img.off('load')
		})
  }
  
  function handlePastePreprocess(plugin, args) {
    let image = clipboard.readImage()
		if (!image.isEmpty()) {
      if (imageUploadEnabled) {
        ipcRenderer.send("add-clipboard-image", currentAuth.uuid, currentBlog.name)
      }
      args.preventDefault()
    } else {
      if (args.content.indexOf("<img") == 0 && args.content.indexOf("blob:file://") > 0) {
        args.preventDefault()
      }
    }
  }

	function handleDrop(e) {
    if (e.dataTransfer && e.dataTransfer.files) {
      onImageHandler(Array.prototype.slice.call(e.dataTransfer.files))  
    }
	}

	function handleFetchOpengraph(url, callback) {
		OpengraphFetcher.fetch(url, og => {
      og.image = makeThumbnail('S200x200', og.image)
      callback(og)
    })
  }
  
  function handleInsertImage(url, filename) {
    if (!imageUploadEnabled) {
      return
    }
    ipcRenderer.send("add-image-url", currentAuth.uuid, currentBlog.name, url, filename)
  }

  function handleToggleGooglePhotos() {
    setOpenGooglePhotos(!openGooglePhotos)
  }

  useEffect(() => {
    ipcRenderer.on("finish-add-file", handleFinishUploadFile)

    return () => {
      ipcRenderer.removeListener("finish-add-file", handleFinishUploadFile)  
    }
  }, [])

  return (
    <>
      <Editor 
        id='tinymce'
        className='content'
        onChange={e => onChange(e.target.getContent())}
        init={{
          plugins: tinymcePlugins,
          toolbar: tinymceToolbar,
          branding: false,
          statusbar: false,
          menubar: false,
          paste_data_images: true,
          valid_children : 'p[s|strike|span|b|u|i|a|#text|br|code|em|sup|sub|q],-h2[img|div|figure|b],figcaption[#text],figure[img|figcaption|br|a|div|span|p|iframe],-span[img],+a[div],-li[blockquote|h2|h3]',
          extended_valid_elements: 'span/font[style],i/em,b/strong,iframe[mapdata|src|id|width|height|frameborder|scrolling|data-*|allowfullscreen],script[type|src]',
          text_inline_elements: 'span strong b em i font s u var cite dfn code mark q sup sub samp',
          width: 600,
          min_height: 500,
          file_picker_type: 'image',
          block_formats: '문단=p;주제=h2;소주제=h3',
          body_class: 'content',
          content_css: [
            '../src/css/content.css',
            '../src/css/tistory-content.css',
            'https://fonts.googleapis.com/css?family=Nanum+Gothic'
          ],
          paste_preprocess: handlePastePreprocess,
          codeblock: {
            highlightStyle: '../node_modules/highlight.js/styles/atom-one-dark.css'
          },
          opengraph: {
            fetch_handler: handleFetchOpengraph
          },
          google_photos: {
            open_handler: handleToggleGooglePhotos
          },
          open_file_handler: onOpenFile,
          init_instance_callback: (editor) => {
            editor.ui.registry.addIcon('media', 'M')
            editor.on("drop", handleDrop)
            editor.setContent(value)
          }
        }}
      />
      
      <GooglePhotosDialog
        open={openGooglePhotos}
        onClose={handleToggleGooglePhotos}
        onSelectImage={handleInsertImage}
      />
    </>
  )
}
