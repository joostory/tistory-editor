import React, { useState, useRef, useEffect } from 'react'
import CodeMirrorComponent from 'react-codemirror-component'
import MarkdownHelper from './MarkdownHelper'

import { Button } from '@material-ui/core'
import { FormatBold, FormatItalic, FormatUnderlined, Attachment } from '@material-ui/icons'

import CodeMirrorHelper from './CodeMirrorHelper'
import GooglePhotosDialog from '../plugins/google-photos/GooglePhotosDialog'
import googlePhotosLogo from '../../../images/google-photos-logo.png'
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


function ToolbarButton({ onClick, children }) {
  const iconButtonStyle = {
    padding: '5px',
    minWidth: '34px',
    height: '34px',
    lineHeight: '24px'
  }

  return (
    <Button variant='text' onClick={onClick} style={iconButtonStyle}>
      {children}
    </Button>
  )
}

export default function MarkdownEditor({ currentBlog, value, onChange }) {
  const [markdownValue, setMarkdownValue] = useState(MarkdownHelper.htmlToMarkdown(value))
  const [openGooglePhotos, setOpenGooglePhotos] = useState(false)
  const editorRef = useRef(null)

	function handlePaste(e) {
		// let image = clipboard.readImage()
		// if (!image.isEmpty()) {
		// 	ipcRenderer.send("add-clipboard-image", currentBlog.name)
		// }
	}

  function handleChangeContent(value) {
    setMarkdownValue(value)
    onChange(MarkdownHelper.markdownToHtml(value))
	}

	function handleHeader2(e) {
		e.preventDefault()
		CodeMirrorHelper.header2(editorRef.current.getCodeMirror())
	}

	function handleHeader3(e) {
		e.preventDefault()
		CodeMirrorHelper.header3(editorRef.current.getCodeMirror())
	}
	
	function handleBold(e) {
		e.preventDefault()
		CodeMirrorHelper.bold(editorRef.current.getCodeMirror())
	}

	function handleItalic(e) {
		e.preventDefault()
		CodeMirrorHelper.italic(editorRef.current.getCodeMirror())
	}

	function handleUnderline(e) {
		e.preventDefault()
		CodeMirrorHelper.underline(editorRef.current.getCodeMirror())
	}

	function handleLink(e) {
		e.preventDefault()
		CodeMirrorHelper.link(editorRef.current.getCodeMirror())
	}

	function handleGooglePhotos(e) {
    setOpenGooglePhotos(true)
	}

	function handleCloseGooglePhotos() {
    setOpenGooglePhotos(false)
	}

	function handleInsertImage(url, title) {
    CodeMirrorHelper.insertImage(editorRef.current.getCodeMirror(), url, title)
	}

  useEffect(() => {
    let cm = editorRef.current.getCodeMirror()
		cm.on("paste", handlePaste)

		const keymap = navigator.userAgent.indexOf('Macintosh') > 0 ? MacKeymap : PcKeymap
    keymap.map(map => cm.addKeyMap(map))
  })

  return (
    <div>
      <div className="markdown-editor">
        <div className="editor-toolbar">
          <ToolbarButton onClick={handleHeader2}>H2</ToolbarButton>
          <ToolbarButton onClick={handleHeader3}>H3</ToolbarButton>
          <ToolbarButton onClick={handleBold}><FormatBold /></ToolbarButton>
          <ToolbarButton onClick={handleItalic}><FormatItalic /></ToolbarButton>
          <ToolbarButton onClick={handleUnderline}><FormatUnderlined /></ToolbarButton>
          <ToolbarButton onClick={handleLink}>Link</ToolbarButton>
          <ToolbarButton onClick={handleGooglePhotos}><img src={googlePhotosLogo} /></ToolbarButton>
        </div>
        <CodeMirrorComponent ref={editorRef}
          options={{
            lineNumbers: false,
            lineWrapping: true,
            mode: 'markdown',
            theme:'tistory-markdown',
            placeholder: '내용을 입력하세요.'
          }}
          value={markdownValue}
          onChange={handleChangeContent}
        />
      </div>

      <GooglePhotosDialog
        open={openGooglePhotos}
        onClose={handleCloseGooglePhotos}
        onSelectImage={handleInsertImage}
      />
    </div>
  )
}

