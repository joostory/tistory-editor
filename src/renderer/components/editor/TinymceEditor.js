import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { ipcRenderer } from 'electron'
import TinyMCE from 'react-tinymce'

class TinymceEditor extends Component {

  constructor(props, context) {
    super(props, context)

    this.state = {
      value: props.value
    }
    this.handleFinishUploadFile = this.handleFinishUploadFile.bind(this)
  }

  componentWillMount() {
    ipcRenderer.on("finish-add-file", this.handleFinishUploadFile)
  }

  componentWillUnmount() {
    ipcRenderer.removeListener("finish-add-file", this.handleFinishUploadFile)
  }

  handleFinishUploadFile(e, fileUrl) {
		console.log("finishUploadFile", fileUrl)
		tinymce.getEditor("tinymce").execCommand('mceInsertContent',false,'<img src="'+fileUrl+'" />');
	}

  getContent() {
    return this.state.value
  }

	handleChange(e) {
		this.setState({
			value: e.target.getContent()
		})
	}

	render() {
		const { value } = this.props

		return (
			<TinyMCE 
				id='tinymce'
				className='content'
				content={ value }
				config={{
          plugins: 'link media table textcolor contextmenu hr preview',
					insert_toolbar: 'quickimage quicktable',
					selection_toolbar: 'bold italic | alignleft aligncenter alignright | bullist numlist | quicklink h2 h3 blockquote',
					resize: false,
					statusbar: false,
					height: '100%',
					theme: 'inlite',
					inline: true,
					file_picker_type: 'image'
        }}
				onChange={this.handleChange.bind(this)}
			/>
		)
	}
}

TinymceEditor.propTypes = {
	value: PropTypes.string.isRequired,
	currentBlog: PropTypes.object.isRequired
}

export default TinymceEditor
