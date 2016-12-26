import React, { Component, PropTypes } from 'react'
import { ipcRenderer } from 'electron'
import Quill from 'quill'

import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'


let quillInstance;

class RichEditor extends Component {

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
    let range = quillInstance.getSelection()
    quillInstance.insertEmbed(range.index, 'image', fileUrl)
	}

  componentDidMount() {
    const { container } = this.refs
    const { value } = this.state

    let options = {
      module: {
        toolbar: false
      },
      theme: 'bubble'
    }

    quillInstance = new Quill(container, options)
  }

  getContent() {
    return quillInstance.root.innerHTML
  }

  updateContent(value) {
    if (quillInstance) {
      quillInstance.setText(value)
    }
  }

  render() {
    const { value } = this.state

    return (
      <div className="Quill">
        <div ref="container" dangerouslySetInnerHTML={{__html:value}} />
      </div>
    )
  }
}

RichEditor.propTypes = {
  value: PropTypes.string.isRequired
}

export default RichEditor
