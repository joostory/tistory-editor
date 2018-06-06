import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { ipcRenderer, clipboard } from 'electron'
import autobind from 'autobind-decorator'
import Codemirror from 'react-codemirror'
import toMarkdown from 'to-markdown'
import marked from 'marked'
import MarkdownHelper from './MarkdownHelper'

import FlatButton from 'material-ui/FlatButton'
import IconButton from 'material-ui/IconButton'
import IconEditorFormatBold from 'material-ui/svg-icons/editor/format-bold'
import IconEditorFormatItalic from 'material-ui/svg-icons/editor/format-italic'
import IconEditorFormatUnderlined from 'material-ui/svg-icons/editor/format-underlined'
import IconFileAttachment from 'material-ui/svg-icons/file/attachment'

import CodeMirrorHelper from './CodeMirrorHelper'
import GooglePhotosDialog from '../plugins/google-photos/GooglePhotosDialog'

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
			openGooglePhotos: false
		}
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

		const keymap = navigator.userAgent.indexOf('Macintosh') > 0 ? MacKeymap : PcKeymap
		keymap.map(map => cm.addKeyMap(map))
	}

	@autobind
  handleFinishUploadFile(e, fileUrl) {
		const { editor } = this.refs
		console.log("finishUploadFile", fileUrl)
		CodeMirrorHelper.insertImage(editor.getCodeMirror(), fileUrl)
	}

	@autobind
	handlePaste(e) {
		const { currentBlog } = this.props

		let image = clipboard.readImage()
		if (!image.isEmpty()) {
			ipcRenderer.send("add-clipboard-image", currentBlog.name)
		}
	}

  getContent() {
    const { value } = this.state
    return MarkdownHelper.markdownToHtml(value)
  }

	@autobind
  handleChangeContent(value) {
    this.setState({
      value: value
    })
	}

	@autobind
	handleHeader2(e) {
		const { editor } = this.refs
		e.preventDefault()
		CodeMirrorHelper.header2(editor.getCodeMirror())
	}

	@autobind
	handleHeader3(e) {
		const { editor } = this.refs
		e.preventDefault()
		CodeMirrorHelper.header3(editor.getCodeMirror())
	}
	
	@autobind
	handleBold(e) {
		const { editor } = this.refs
		e.preventDefault()
		CodeMirrorHelper.bold(editor.getCodeMirror())
	}

	@autobind
	handleItalic(e) {
		const { editor } = this.refs
		e.preventDefault()
		CodeMirrorHelper.italic(editor.getCodeMirror())
	}

	@autobind
	handleUnderline(e) {
		const { editor } = this.refs
		e.preventDefault()
		CodeMirrorHelper.underline(editor.getCodeMirror())
	}

	@autobind
	handleLink(e) {
		const { editor } = this.refs
		e.preventDefault()
		CodeMirrorHelper.link(editor.getCodeMirror())
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
	handleInsertImage(url) {
		const { editor } = this.refs
		CodeMirrorHelper.insertImage(editor.getCodeMirror(), url)
	}

  render() {
		const { onOpenFile } = this.props
    const { value, openGooglePhotos } = this.state

    const options = {
			lineNumbers: false,
			lineWrapping: true,
			mode: 'markdown',
			theme:'default'
		}
		
		const iconButtonStyle = {
			padding: '5px',
			minWidth: '34px',
			height: '34px',
			lineHeight: '24px'
		}

		return (
			<div>
				<div className="editor-toolbar">
					<FlatButton onClick={this.handleHeader2} style={iconButtonStyle}>H2</FlatButton>
					<FlatButton onClick={this.handleHeader3} style={iconButtonStyle}>H3</FlatButton>
					<FlatButton onClick={this.handleBold} style={iconButtonStyle} icon={<IconEditorFormatBold />} />
					<FlatButton onClick={this.handleItalic} style={iconButtonStyle} icon={<IconEditorFormatItalic />} />
					<FlatButton onClick={this.handleUnderline} style={iconButtonStyle} icon={<IconEditorFormatUnderlined />} />
					<FlatButton onClick={this.handleLink} style={iconButtonStyle}>Link</FlatButton>
					<FlatButton onClick={this.handleGooglePhotos} style={iconButtonStyle} icon={<img src='../src/images/google-photos-logo.png' />} />
					<FlatButton onClick={onOpenFile} style={iconButtonStyle} icon={<IconFileAttachment />} />
				</div>
				<Codemirror ref="editor" options={options} value={value}
					onChange={this.handleChangeContent} />
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
