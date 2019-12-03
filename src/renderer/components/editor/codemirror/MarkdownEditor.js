import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import { ipcRenderer, clipboard } from 'electron'
import autobind from 'autobind-decorator'
import CodeMirrorComponent from 'react-codemirror-component'
import MarkdownHelper from './MarkdownHelper'

import { Button } from '@material-ui/core'
import { FormatBold, FormatItalic, FormatUnderlined, Attachment } from '@material-ui/icons'

import CodeMirrorHelper from './CodeMirrorHelper'
import GooglePhotosDialog from '../plugins/google-photos/GooglePhotosDialog'
import "../../../styles/lib/codemirror/tistory-markdown-theme.scss"
import "codemirror/lib/codemirror.css"
import "codemirror/addon/dialog/dialog.css"
import "codemirror/mode/javascript/javascript"
import "codemirror/mode/xml/xml"
import "codemirror/mode/markdown/markdown"
import "codemirror/addon/dialog/dialog"
import "codemirror/addon/search/search"
import "codemirror/addon/search/searchcursor"
import "codemirror/addon/search/jump-to-line"
import "codemirror/addon/display/placeholder"

const MacKeymap = [
	{ 'Cmd-2': (cm) => CodeMirrorHelper.header2(cm) },
	{ 'Cmd-3': (cm) => CodeMirrorHelper.header3(cm) },
	{ 'Cmd-B': (cm) => CodeMirrorHelper.bold(cm) },
	{ 'Cmd-I': (cm) => CodeMirrorHelper.italic(cm) },
	{ 'Cmd-U': (cm) => CodeMirrorHelper.underline(cm) },
	{ 'Cmd-K': (cm) => CodeMirrorHelper.link(cm) }
]

const PcKeymap = [
	{ 'Ctrl-2': (cm) => CodeMirrorHelper.header2(cm) },
	{ 'Ctrl-3': (cm) => CodeMirrorHelper.header3(cm) },
	{ 'Ctrl-B': (cm) => CodeMirrorHelper.bold(cm) },
	{ 'Ctrl-I': (cm) => CodeMirrorHelper.italic(cm) },
	{ 'Ctrl-U': (cm) => CodeMirrorHelper.underline(cm) },
	{ 'Ctrl-K': (cm) => CodeMirrorHelper.link(cm) }
]

class MarkdownEditor extends Component {

  constructor(props, context) {
    super(props, context)
    this.state = {
			value: MarkdownHelper.htmlToMarkdown(props.value),
			openGooglePhotos: false,
    }

    this.editor = React.createRef()
  }

  componentWillMount() {
		ipcRenderer.on("finish-add-file", this.handleFinishUploadFile)
	}

	componentWillUnmount() {
		ipcRenderer.removeListener("finish-add-file", this.handleFinishUploadFile)
	}

	componentDidMount() {
		let cm = this.editor.current.getCodeMirror()
		cm.on("paste", this.handlePaste)

		const keymap = navigator.userAgent.indexOf('Macintosh') > 0 ? MacKeymap : PcKeymap
		keymap.map(map => cm.addKeyMap(map))
  }
  
	@autobind
  handleFinishUploadFile(e, fileUrl) {
		console.log("finishUploadFile", fileUrl)
		CodeMirrorHelper.insertImage(this.editor.current.getCodeMirror(), fileUrl)
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
  handleChangeContent(value) {
    const { onChange } = this.props
    this.setState({
      value: value
    })
    onChange(MarkdownHelper.markdownToHtml(value))
	}

	@autobind
	handleHeader2(e) {
		e.preventDefault()
		CodeMirrorHelper.header2(this.editor.current.getCodeMirror())
	}

	@autobind
	handleHeader3(e) {
		e.preventDefault()
		CodeMirrorHelper.header3(this.editor.current.getCodeMirror())
	}
	
	@autobind
	handleBold(e) {
		e.preventDefault()
		CodeMirrorHelper.bold(this.editor.current.getCodeMirror())
	}

	@autobind
	handleItalic(e) {
		e.preventDefault()
		CodeMirrorHelper.italic(this.editor.current.getCodeMirror())
	}

	@autobind
	handleUnderline(e) {
		e.preventDefault()
		CodeMirrorHelper.underline(this.editor.current.getCodeMirror())
	}

	@autobind
	handleLink(e) {
		e.preventDefault()
		CodeMirrorHelper.link(this.editor.current.getCodeMirror())
	}

	@autobind
	handleGooglePhotos(e) {
		this.setState({
			openGooglePhotos: true
		})
	}

	@autobind
	handleCloseGooglePhotos() {
		this.setState({
			openGooglePhotos: false
		})
	}

	@autobind
	handleInsertImage(url, filename) {
    const { currentBlog } = this.props
    ipcRenderer.send("add-image-url", currentBlog.name, url, filename)
	}

  render() {
		const { onOpenFile } = this.props
    const { value, openGooglePhotos } = this.state

    const options = {
			lineNumbers: false,
			lineWrapping: true,
			mode: 'markdown',
      theme:'tistory-markdown',
      placeholder: '내용을 입력하세요.'
		}
		
		const iconButtonStyle = {
			padding: '5px',
			minWidth: '34px',
			height: '34px',
			lineHeight: '24px'
		}

		return (
			<div>
				<div className="markdown-editor">
					<div className="editor-toolbar">
						<Button variant='text' onClick={this.handleHeader2} style={iconButtonStyle}>H2</Button>
						<Button variant='text' onClick={this.handleHeader3} style={iconButtonStyle}>H3</Button>
						<Button variant='text' onClick={this.handleBold} style={iconButtonStyle}><FormatBold /></Button>
						<Button variant='text' onClick={this.handleItalic} style={iconButtonStyle}><FormatItalic /></Button>
						<Button variant='text' onClick={this.handleUnderline} style={iconButtonStyle}><FormatUnderlined /></Button>
						<Button variant='text' onClick={this.handleLink} style={iconButtonStyle}>Link</Button>
						<Button variant='text' onClick={this.handleGooglePhotos} style={iconButtonStyle}><img src='../src/images/google-photos-logo.png' /></Button>
						<Button variant='text' onClick={onOpenFile} style={iconButtonStyle}><Attachment /></Button>
					</div>
          <CodeMirrorComponent ref={this.editor}
            options={options}
            value={value}
						onChange={this.handleChangeContent}
          />
				</div>
				<GooglePhotosDialog open={openGooglePhotos} onClose={this.handleCloseGooglePhotos} onSelectImage={this.handleInsertImage} />
			</div>
		)
  }
}

MarkdownEditor.propTypes = {
  value: PropTypes.string.isRequired,
	currentBlog: PropTypes.object.isRequired
}

export default MarkdownEditor
