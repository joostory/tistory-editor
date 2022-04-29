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

import 'codemirror/mode/clojure/clojure'
import 'codemirror/mode/python/python'
import 'codemirror/mode/clike/clike'
import 'codemirror/mode/go/go'
import 'codemirror/mode/xml/xml'

import GooglePhotosDialog from '../plugins/google-photos/GooglePhotosDialog'
import { makeThumbnail } from '../../../modules/ThumbnailHelper'

export default function TinymceEditor({ value, onImageHandler, onOpenFile, onChange }) {
  const currentAuth = useSelector(state => state.currentAuth)
  const currentBlog = useSelector(state => state.currentBlog)
  const [openGooglePhotos, setOpenGooglePhotos] = useState(false)
  const imageUploadEnabled = useMemo(() => currentAuth.provider == 'tistory', [currentAuth])

  const tinymcePlugins = useMemo(() => {
    if (imageUploadEnabled) {
      return 'link table lists codeblock opengraph google-photos file-upload autoresize searchreplace'
    } else {
      return 'link table lists codeblock opengraph autoresize searchreplace'
    }
  }, [imageUploadEnabled])
  const tinymceToolbar = useMemo(() => {
    if (imageUploadEnabled) {
      return 'blocks bold italic link inlinecode | alignleft aligncenter alignright | bullist numlist | blockquote codeblock google-photos file-upload opengraph hr removeformat'
    } else {
      return 'blocks bold italic link inlinecode | alignleft aligncenter alignright | bullist numlist | blockquote codeblock opengraph hr removeformat'
    }
  }, [imageUploadEnabled])

  function handleFinishUploadFile(e, fileUrl) {
		console.log("finishUploadFile", fileUrl)
		const editor = tinymce.activeEditor
    const dom = editor.dom
		editor.execCommand('mceInsertContent', false, '<img id="__photos_new" src="'+fileUrl+'" />');
		let $img = dom.select('#__photos_new')
		dom.setAttrib($img, 'id')
    dom.bind($img, 'load', e => {
      editor.nodeChanged()
			dom.unbind($img, 'load')
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
    OpengraphFetcher.fetch(url)
      .then(og => {
        og.image = makeThumbnail('S200x200', og.image)
        callback(og)
      })
      .catch(error => {
        console.error(error)
        callback(null)
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
            highlightStyle: '../node_modules/highlight.js/styles/atom-one-dark.css',
            langs: [
              { value: 'javascript', mode: 'javascript', label: 'Javascript' },
              { value: 'typescript', mode: 'javascript', label: 'Typescript' },
              { value: 'html', mode: 'xml', label: 'HTML' },
              { value: 'python', mode: 'python', label: 'Python' },
              { value: 'java', mode: 'clike', label: 'Java' },
              { value: 'go', mode: 'go', label: 'Go' },
              { value: 'Kotlin', mode: 'clike', label: 'Kotlin' },
              { value: 'clojure', mode: 'clojure', label: 'Clojure' },
            ]
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
