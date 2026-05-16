import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { useAtomValue } from 'jotai'
import { ipcRenderer, clipboard } from 'electron'
import CodeMirror, { EditorView } from '@uiw/react-codemirror'
import { markdown, markdownLanguage } from '@codemirror/lang-markdown'
import { languages } from '@codemirror/language-data'
import MarkdownHelper from './MarkdownHelper'

import { Button, Box } from '@mui/material'
import { FormatBold, FormatItalic, FormatUnderlined, Attachment } from '@mui/icons-material'
import { currentAuthState, currentBlogState } from '../../../state/currentBlog'

import CodeMirrorHelper from './CodeMirrorHelper'

const styles = {
  toolbar: {
    position: 'fixed',
    top: 15,
    width: 700,
    display: 'flex',
    alignItems: 'center',
    borderRadius: (theme) => 1,
    paddingLeft: (theme) => theme.spacing(0.5),
    height: (theme) => theme.spacing(5),
    left: '50%',
    transform: 'translate(-50%,0)',
    zIndex: 10,
    background: (theme) => theme.palette.headerBackground,
    boxShadow: (theme) => theme.shadows[1]
  },
  toolbarBtn: {
    padding: '5px',
    minWidth: '34px',
    height: '34px'
  },
  editor: {
    '.cm-editor': {
      height: 'auto',
      minHeight: '500px',
      backgroundColor: '#fff !important',
      color: '#333 !important',
      padding: '20px 0 40px',
      '& .cm-line': {
        padding: '0px',
      }
    },
    '.cm-scroller': {
      fontFamily: 'Nanum Gothic, sans-serif',
      lineHeight: 1.6,
    },
    '.cm-content': {
      color: '#333 !important',
      fontSize: '14px',
    },
    '.cm-focused': {
      outline: 'none !important'
    }
  }
}

function ToolbarButton({ onClick, children }) {
  return (
    <Button variant='text' onClick={onClick} sx={styles.toolbarBtn}>
      {children}
    </Button>
  )
}

export default function MarkdownEditor({ value, onOpenFile, onChange }) {
  const currentAuth = useAtomValue(currentAuthState)
  const currentBlog = useAtomValue(currentBlogState)
  const [markdownValue, setMarkdownValue] = useState(MarkdownHelper.htmlToMarkdown(value))
  const editorRef = useRef(null)

  const imageUploadEnabled = useMemo(() => currentAuth.provider == 'tistory', [currentAuth])

  const handlePaste = useCallback((e) => {
    if (imageUploadEnabled) {
      let image = clipboard.readImage()
      if (!image.isEmpty()) {
        ipcRenderer.send("add-clipboard-image", currentAuth.uuid, currentBlog.name)
      }
    }
  }, [imageUploadEnabled, currentAuth, currentBlog])

  const handleChangeContent = useCallback((val) => {
    setMarkdownValue(val)
    onChange(MarkdownHelper.markdownToHtml(val))
  }, [onChange])

  const handleHeader2 = (e) => {
    e.preventDefault()
    if (editorRef.current?.view) CodeMirrorHelper.header2(editorRef.current.view)
  }

  const handleHeader3 = (e) => {
    e.preventDefault()
    if (editorRef.current?.view) CodeMirrorHelper.header3(editorRef.current.view)
  }

  const handleBold = (e) => {
    e.preventDefault()
    if (editorRef.current?.view) CodeMirrorHelper.bold(editorRef.current.view)
  }

  const handleItalic = (e) => {
    e.preventDefault()
    if (editorRef.current?.view) CodeMirrorHelper.italic(editorRef.current.view)
  }

  const handleUnderline = (e) => {
    e.preventDefault()
    if (editorRef.current?.view) CodeMirrorHelper.underline(editorRef.current.view)
  }

  const handleLink = (e) => {
    e.preventDefault()
    if (editorRef.current?.view) CodeMirrorHelper.link(editorRef.current.view)
  }

  const handleFinishUploadFile = useCallback((e, fileUrl) => {
    if (editorRef.current?.view) CodeMirrorHelper.insertImage(editorRef.current.view, fileUrl)
  }, [])

  useEffect(() => {
    ipcRenderer.on("finish-add-file", handleFinishUploadFile)
    return () => {
      ipcRenderer.removeListener("finish-add-file", handleFinishUploadFile)
    }
  }, [handleFinishUploadFile])

  return (
    <Box>
      <Box sx={styles.toolbar}>
        <ToolbarButton onClick={handleHeader2}>H2</ToolbarButton>
        <ToolbarButton onClick={handleHeader3}>H3</ToolbarButton>
        <ToolbarButton onClick={handleBold}><FormatBold /></ToolbarButton>
        <ToolbarButton onClick={handleItalic}><FormatItalic /></ToolbarButton>
        <ToolbarButton onClick={handleUnderline}><FormatUnderlined /></ToolbarButton>
        <ToolbarButton onClick={handleLink}>Link</ToolbarButton>
        {imageUploadEnabled && <ToolbarButton onClick={onOpenFile}><Attachment /></ToolbarButton>}
      </Box>

      <Box sx={styles.editor}>
        <CodeMirror
          ref={editorRef}
          value={markdownValue}
          height="auto"
          minHeight="500px"
          theme="light"
          extensions={[
            markdown({ base: markdownLanguage, codeLanguages: languages }),
            EditorView.lineWrapping
          ]}
          onChange={handleChangeContent}
          placeholder="내용을 입력하세요."
          basicSetup={{
            lineNumbers: false,
            foldGutter: false,
          }}
          onPaste={handlePaste}
        />
      </Box>
    </Box>
  )
}
