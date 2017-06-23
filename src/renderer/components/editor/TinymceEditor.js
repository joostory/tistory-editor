import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { ipcRenderer, clipboard } from 'electron'
import TinyMCE from 'react-tinymce'
import OpengraphFetcher from '../../../lib/OpengraphFetcher'

class TinymceEditor extends Component {

  constructor(props, context) {
    super(props, context)

    this.handleFinishUploadFile = this.handleFinishUploadFile.bind(this)
		this.handlePaste = this.handlePaste.bind(this)
		this.handleDrop = this.handleDrop.bind(this)
		this.handleFetchOpengraph = this.handleFetchOpengraph.bind(this)
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

  handleFinishUploadFile(e, fileUrl) {
		console.log("finishUploadFile", fileUrl)
		tinymce.activeEditor.execCommand('mceInsertContent', false, '<img src="'+fileUrl+'" />');
	}

	handlePaste(e) {
		const { currentBlog } = this.props

		let text = clipboard.readHTML()
		let image = clipboard.readImage()
		if (!text && !image.isEmpty()) {
			ipcRenderer.send("add-clipboard-image", currentBlog.name)
		} else {
			tinymce.activeEditor.execCommand('mceInsertContent', false, text);
		}
	}

	handleDrop(e) {
		const { onImageHandler } = this.props
		onImageHandler(Array.prototype.slice.call(e.dataTransfer.files))
	}

	handleFetchOpengraph(url, callback) {
		OpengraphFetcher.fetch(url, callback)
	}

  getContent() {
		return tinymce.activeEditor.getContent()
  }

	render() {
		const { value, currentBlog } = this.props

		return (
			<TinyMCE 
				id='tinymce'
				className='content'
				config={{
          plugins: 'link table textcolor hr lists paste codeblock opengraph',
					toolbar: 'formatselect bold italic link inlinecode | alignleft aligncenter alignright | bullist numlist | blockquote codeblock opengraph hr removeformat',
					resize: false,
					branding: false,
					statusbar: false,
					menubar: false,
					paste_as_text: true,
					paste_data_images: true,
					height: '100%',
					file_picker_type: 'image',
					block_formats: '문단=p;제목 2=h2;제목 3=h3',
					body_class: 'content',
					content_css: '../src/css/content.css',
					paste_preprocess: (plugin, args) => {
						args.preventDefault()
					},
					codeblock: {
						highlightStyle: '../node_modules/highlightjs/styles/atom-one-dark.css'
					},
					opengraph: {
						fetch_handler: this.handleFetchOpengraph
					},
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
