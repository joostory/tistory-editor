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
import EditorFormatBold from 'material-ui/svg-icons/editor/format-bold'
import EditorFormatItalic from 'material-ui/svg-icons/editor/format-italic'
import EditorFormatUnderlined from 'material-ui/svg-icons/editor/format-underlined'

import CodeMirrorHelper from './CodeMirrorHelper'

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
      value: MarkdownHelper.htmlToMarkdown(props.value)
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

	shouldComponentUpdate(nextProps, nextState) {
		return false
	}

	@autobind
  handleFinishUploadFile(e, fileUrl) {
		const { editor } = this.refs
		console.log("finishUploadFile", fileUrl)
		if (fileUrl) {
			let cm = editor.getCodeMirror()
			let CodeMirror = editor.getCodeMirrorInstance()
			cm.replaceRange("![](" + fileUrl + ")\n\n", CodeMirror.Pos(cm.getCursor().line))
		}
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

  render() {
    const { value } = this.state

    const options = {
			lineNumbers: false,
			lineWrapping: true,
			mode: 'markdown',
			theme:'default'
		}
		
		const iconButtonStyle = {
			padding: '6px',
			minWidth: '36px',
			height: '36px',
			lineHeight: '24px',
			verticalAlign: 'center'
		}

		return (
			<div>
				<div className="editor-toolbar">
					<FlatButton onClick={this.handleHeader2} style={iconButtonStyle}>H2</FlatButton>
					<FlatButton onClick={this.handleHeader3} style={iconButtonStyle}>H3</FlatButton>
					<FlatButton onClick={this.handleBold} style={iconButtonStyle} icon={<EditorFormatBold />} />
					<FlatButton onClick={this.handleItalic} style={iconButtonStyle} icon={<EditorFormatItalic />} />
					<FlatButton onClick={this.handleUnderline} style={iconButtonStyle} icon={<EditorFormatUnderlined />} />
					<FlatButton onClick={this.handleLink} style={iconButtonStyle}>Link</FlatButton>
				</div>
				<Codemirror ref="editor" options={options} value={value}
					onChange={this.handleChangeContent} />
			</div>
		)
  }
}

MarkdownEditor.propTypes = {
  value: PropTypes.string.isRequired,
	currentBlog: PropTypes.object.isRequired
}

export default MarkdownEditor
