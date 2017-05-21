import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { ipcRenderer, clipboard } from 'electron'
import Codemirror from 'react-codemirror'
import 'codemirror/lib/codemirror.css'
import 'codemirror/addon/dialog/dialog.css'
import 'codemirror/mode/javascript/javascript'
import 'codemirror/mode/xml/xml'
import 'codemirror/mode/markdown/markdown'
import 'codemirror/addon/dialog/dialog'
import 'codemirror/addon/search/search'
import 'codemirror/addon/search/searchcursor'
import 'codemirror/addon/search/jump-to-line'
import toMarkdown from 'to-markdown'
import marked from 'marked'

class MarkdownEditor extends Component {

  constructor(props, context) {
    super(props, context)
    this.state = {
      value: toMarkdown(props.value)
    }

    this.handleFinishUploadFile = this.handleFinishUploadFile.bind(this)
		this.handlePaste = this.handlePaste.bind(this)
  }

  componentWillMount() {
		ipcRenderer.on("finish-add-file", this.handleFinishUploadFile)
	}

	componentWillUnmount() {
		ipcRenderer.removeListener("finish-add-file", this.handleFinishUploadFile)
	}

	componentDidMount() {
		const { editor } = this.refs
		let cm = editor.getCodeMirror()
		cm.on("paste", this.handlePaste)
	}

  handleFinishUploadFile(e, fileUrl) {
		const { editor } = this.refs
		console.log("finishUploadFile", fileUrl)
		if (fileUrl) {
			let cm = editor.getCodeMirror()
			let CodeMirror = editor.getCodeMirrorInstance()
			cm.replaceRange("![](" + fileUrl + ")\n\n", CodeMirror.Pos(cm.getCursor().line))
		}
	}

	handlePaste(e) {
		const { currentBlog } = this.props

		let image = clipboard.readImage()
		if (!image.isEmpty()) {
			ipcRenderer.send("add-clipboard-image", currentBlog.name)
			console.log(image.getSize())
		}
	}

  getContent() {
    const { value } = this.state
    return marked(value)
  }

  handleChangeContent(value) {
    this.setState({
      value: value
    })
  }

  render() {
    const { value } = this.state

    let options = {
			lineNumbers: false,
			lineWrapping: true,
			mode: 'markdown',
			theme:'default'
    }

		return (
			<Codemirror ref="editor" options={options} value={value}
				onChange={this.handleChangeContent.bind(this)} />
		)
  }
}

MarkdownEditor.propTypes = {
  value: PropTypes.string.isRequired,
	currentBlog: PropTypes.object.isRequired
}

export default MarkdownEditor
