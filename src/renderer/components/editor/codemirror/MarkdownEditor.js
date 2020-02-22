import React, { useState, useRef, useEffect, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { ipcRenderer, clipboard } from 'electron'
import CodeMirrorComponent from 'react-codemirror-component'
import MarkdownHelper from './MarkdownHelper'

import { Button, Box, makeStyles } from '@material-ui/core'
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

const useStyles = makeStyles(theme => ({
  toolbar: {
    position: 'fixed',
    top:15,
    width:600,
    height:34,
    left: '50%',
    transform: 'translate(-50%,0)',
    zIndex:10,
    background: 'transparent'
  },
  toolbarBtn: {
    padding: 5,
    minWidth: 34,
    height: 34
  }
}))

function ToolbarButton({ onClick, children }) {
  const classes = useStyles()

  return (
    <Button variant='text' onClick={onClick} className={classes.toolbarBtn}>
      {children}
    </Button>
  )
}

export default function MarkdownEditor({ value, onOpenFile, onChange }) {
  const classes = useStyles()
  const currentAuth = useSelector(state => state.currentAuth)
  const currentBlog = useSelector(state => state.currentBlog)
  const [markdownValue, setMarkdownValue] = useState(MarkdownHelper.htmlToMarkdown(value))
  const [openGooglePhotos, setOpenGooglePhotos] = useState(false)
  const editorRef = useRef(null)

  const imageUploadEnabled = useMemo(() => currentAuth.provider == 'tistory', [currentAuth])

	function handlePaste(e) {
    if (imageUploadEnabled) {
      let image = clipboard.readImage()
      if (!image.isEmpty()) {
        ipcRenderer.send("add-clipboard-image", currentAuth.uuid, currentBlog.name)
      }
    }
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

	function handleInsertImage(url, fileName) {
    ipcRenderer.send("add-image-url", currentAuth.uuid, currentBlog.name, url, fileName)
  }
  
  function handleFinishUploadFile(e, fileUrl) {
    CodeMirrorHelper.insertImage(editorRef.current.getCodeMirror(), fileUrl)
  }

  useEffect(() => {
    let cm = editorRef.current.getCodeMirror()
		cm.on("paste", handlePaste)

		const keymap = navigator.userAgent.indexOf('Macintosh') > 0 ? MacKeymap : PcKeymap
    keymap.map(map => cm.addKeyMap(map))

    ipcRenderer.on("finish-add-file", handleFinishUploadFile)

    return () => {
      ipcRenderer.removeListener("finish-add-file", handleFinishUploadFile)
    }
  }, [])

  return (
    <Box>
      <Box className={classes.toolbar}>
        <ToolbarButton onClick={handleHeader2}>H2</ToolbarButton>
        <ToolbarButton onClick={handleHeader3}>H3</ToolbarButton>
        <ToolbarButton onClick={handleBold}><FormatBold /></ToolbarButton>
        <ToolbarButton onClick={handleItalic}><FormatItalic /></ToolbarButton>
        <ToolbarButton onClick={handleUnderline}><FormatUnderlined /></ToolbarButton>
        <ToolbarButton onClick={handleLink}>Link</ToolbarButton>
        {imageUploadEnabled && <ToolbarButton onClick={handleGooglePhotos}><img src={googlePhotosLogo} /></ToolbarButton>}
        {imageUploadEnabled && <ToolbarButton onClick={onOpenFile}><Attachment /></ToolbarButton>}
      </Box>

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

      <GooglePhotosDialog
        open={openGooglePhotos}
        onClose={handleCloseGooglePhotos}
        onSelectImage={handleInsertImage}
      />
    </Box>
  )
}

