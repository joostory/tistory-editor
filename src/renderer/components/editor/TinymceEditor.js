import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { ipcRenderer, clipboard } from 'electron'
import autobind from 'autobind-decorator'
import TinyMCE from 'react-tinymce'
import OpengraphFetcher from '../../../lib/OpengraphFetcher'
import '../../modules/tinymce/plugins/google-photos'
import '../../modules/tinymce/plugins/file-upload'

class TinymceEditor extends Component {

  constructor(props, context) {
    super(props, context)
  }

  componentWillMount() {
    ipcRenderer.on("finish-add-file", this.handleFinishUploadFile)
  }

  componentWillUnmount() {
    ipcRenderer.removeListener("finish-add-file", this.handleFinishUploadFile)
  }

	shouldComponentUpdate(nextProps, nextState) {
		return false
	}

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
		onImageHandler(Array.prototype.slice.call(e.dataTransfer.files))
	}

	@autobind
	handleFetchOpengraph(url, callback) {
		OpengraphFetcher.fetch(url, callback)
	}

  getContent() {
		return tinymce.activeEditor.getContent()
  }

	render() {
		const { value, currentBlog, onOpenFile } = this.props

		return (
			<TinyMCE 
				id='tinymce'
				className='content'
				config={{
          plugins: 'link table textcolor hr lists paste codeblock opengraph google-photos file-upload autoresize searchreplace',
					toolbar: 'formatselect bold italic link inlinecode | alignleft aligncenter alignright | bullist numlist | blockquote codeblock google-photos file-upload opengraph hr removeformat',
					resize: false,
					branding: false,
					statusbar: false,
					menubar: false,
          paste_data_images: true,
          extended_valid_elements : 'script[type|src]',
					height: '100%',
					file_picker_type: 'image',
					block_formats: '문단=p;주제=h2;소주제=h3',
					body_class: 'content',
					content_css: '../src/css/content.css',
					paste_preprocess: (plugin, args) => {
						let image = clipboard.readImage()
						if (!image.isEmpty()) {
							args.preventDefault()
						}
					},
					codeblock: {
						highlightStyle: '../node_modules/highlightjs/styles/atom-one-dark.css'
					},
					opengraph: {
						fetch_handler: this.handleFetchOpengraph
					},
					open_file_handler: onOpenFile,
					init_instance_callback: (editor) => {
						editor.on("paste", this.handlePaste)
						editor.on("drop", this.handleDrop)
						editor.setContent(value)
					}
        }}
			/>
		)
	}
}

TinymceEditor.propTypes = {
	value: PropTypes.string.isRequired,
	currentBlog: PropTypes.object.isRequired,
	onImageHandler: PropTypes.func.isRequired
}

export default TinymceEditor
