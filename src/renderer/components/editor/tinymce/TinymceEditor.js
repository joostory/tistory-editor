import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import { ipcRenderer, clipboard } from 'electron'
import autobind from 'autobind-decorator'
import OpengraphFetcher from 'opengraph-fetcher'

import tinymce from 'tinymce'
import { Editor } from '@tinymce/tinymce-react'

import 'tinymce-plugin-opengraph'
import 'tinymce-plugin-codeblock'
import './plugins/google-photos'
import './plugins/file-upload'

import GooglePhotosDialog from '../plugins/google-photos/GooglePhotosDialog'
import { makeThumbnail } from '../../../modules/ThumbnailHelper'

class TinymceEditor extends Component {

  constructor(props, context) {
    super(props, context)
    this.state = {
      openGooglePhotos: false
    }
  }

  componentWillMount() {
    ipcRenderer.on("finish-add-file", this.handleFinishUploadFile)
  }

  componentWillUnmount() {
    ipcRenderer.removeListener("finish-add-file", this.handleFinishUploadFile)
  }

	// shouldComponentUpdate(nextProps, nextState) {
	// 	return false
	// }

	@autobind
  handleFinishUploadFile(e, fileUrl) {
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

	@autobind
	handlePaste(e) {
		const { currentBlog } = this.props

		let image = clipboard.readImage()
		if (!image.isEmpty()) {
			ipcRenderer.send("add-clipboard-image", currentBlog.name)
		}
	}

	@autobind
	handleDrop(e) {
    const { onImageHandler } = this.props
    if (e.dataTransfer && e.dataTransfer.files) {
      onImageHandler(Array.prototype.slice.call(e.dataTransfer.files))  
    }
	}

	@autobind
	handleFetchOpengraph(url, callback) {
		OpengraphFetcher.fetch(url, og => {
      og.image = makeThumbnail('S200x200', og.image)
      callback(og)
    })
  }
  
  @autobind
  handleInsertImage(url, filename) {
    const { currentBlog } = this.props
    ipcRenderer.send("add-image-url", currentBlog.name, url, filename)
  }

  @autobind
  handleToggleGooglePhotos() {
    const { openGooglePhotos } = this.state
    this.setState({
      openGooglePhotos: !openGooglePhotos
    })
  }

  getContent() {
		return tinymce.activeEditor.getContent()
  }

	render() {
    const { value, currentBlog, onOpenFile, onChange } = this.props
    const { openGooglePhotos } = this.state

		return (
      <Fragment>
        <Editor 
          id='tinymce'
          className='content'
          onChange={e => onChange(e.target.getContent())}
          init={{
            plugins: 'link table textcolor hr lists paste codeblock opengraph google-photos file-upload autoresize searchreplace',
            toolbar: 'formatselect bold italic link inlinecode | alignleft aligncenter alignright | bullist numlist | blockquote codeblock google-photos file-upload opengraph hr removeformat',
            branding: false,
            statusbar: false,
            menubar: false,
            paste_data_images: true,
            valid_children : 'p[s|strike|span|b|u|i|a|#text|br|code|em|sup|sub],-h2[img|div|figure|b],figcaption[#text],figure[img|figcaption|br|a|div|span|p|iframe],-span[img],+a[div],-li[blockquote|h2|h3]',
            extended_valid_elements: 'span/font[style],i/em,b/strong,iframe[mapdata|src|id|width|height|frameborder|scrolling|data-*|allowfullscreen],script[type|src]',
            text_inline_elements: 'span strong b em i font s u var cite dfn code mark q sup sub samp',
            width: 700,
            min_height: 500,
            file_picker_type: 'image',
            block_formats: '문단=p;주제=h2;소주제=h3',
            body_class: 'content',
            content_css: [
              '../src/css/content.css',
              '../src/css/tistory-content.css',
              'https://fonts.googleapis.com/css?family=Nanum+Gothic'
            ],
            paste_preprocess: (plugin, args) => {
              let image = clipboard.readImage()
              if (!image.isEmpty()) {
                args.preventDefault()
              }
            },
            codeblock: {
              highlightStyle: '../node_modules/highlight.js/styles/atom-one-dark.css'
            },
            opengraph: {
              fetch_handler: this.handleFetchOpengraph
            },
            google_photos: {
              open_handler: this.handleToggleGooglePhotos
            },
            open_file_handler: onOpenFile,
            init_instance_callback: (editor) => {
              editor.ui.registry.addIcon('media', 'M')
              editor.on("paste", this.handlePaste)
              editor.on("drop", this.handleDrop)
              editor.setContent(value)
            }
          }}
        />
        
        <GooglePhotosDialog
          open={openGooglePhotos}
          onClose={this.handleToggleGooglePhotos}
          onSelectImage={this.handleInsertImage}
        />
      </Fragment>
		)
	}
}

TinymceEditor.propTypes = {
	value: PropTypes.string.isRequired,
	currentBlog: PropTypes.object.isRequired,
	onImageHandler: PropTypes.func.isRequired
}

export default TinymceEditor
