import React, { useState } from 'react'
import { ipcRenderer } from 'electron'

import * as EditorMode from '../../constants/EditorMode'
import MarkdownEditor from './codemirror/MarkdownEditor'
import TiptapEditor from './tiptap/TiptapEditor'
import EditorSwitch from './EditorSwich'
import { Container, InputBase } from '@mui/material'
import { useAtomValue } from 'jotai'
import { preferencesState } from '../../state/preferences'
import { currentBlogState, currentAuthState } from '../../state/currentBlog'

const styles = {
  container: {
    width: 700,
    padding: '0 50px',
    backgroundColor: '#fff',
    boxShadow:(theme) => theme.shadows[1],
    borderRadius:(theme) => theme.spacing(0.5)
  },
  titleInput: {
    marginTop:(theme) => theme.spacing(4),
    fontSize:(theme) => theme.spacing(4),
    color: '#333'
  }
}

function Editor({editorMode, content, onChange}) {
  if (editorMode == EditorMode.TIPTAP) {
    return (
      <TiptapEditor
        value={content}
        onChange={onChange}
      />
    )
  } else {
    return (
      <MarkdownEditor
        value={content}
        onChange={onChange}
      />
    )
  } 
}

export default function EditorContent({content, onChange, title, onTitleChange}) {
  const currentAuth = useAtomValue(currentAuthState)
	const preferences = useAtomValue(preferencesState)

  const [editorMode, setEditorMode] = useState(preferences.editor || EditorMode.MARKDOWN)

	async function handleChangeEditorMode(selectedMode) {
    if (selectedMode === editorMode) return

    const fromFormat = editorMode === EditorMode.TIPTAP ? 'json' : 'markdown'
    const toFormat = selectedMode === EditorMode.TIPTAP ? 'json' : 'markdown'

    try {
      const converted = await ipcRenderer.invoke('convert-content', {
        content: content,
        from: fromFormat,
        to: toFormat
      })
      onChange(converted)
      setEditorMode(selectedMode)
    } catch (e) {
      console.error("Failed to convert content format", e)
      setEditorMode(selectedMode)
    }
  }

  return (
    <>
      <Container sx={styles.container} disableGutters={true}>
        {currentAuth && currentAuth.provider !== 'tumblr' && (
          <InputBase
            sx={styles.titleInput}
            autoFocus={true}
            fullWidth={true}
            multiline={true}
            placeholder='제목을 입력하세요.'
            value={title}
            onChange={onTitleChange}
          />
        )}

        <div className="editor_inner">
          <Editor
            editorMode={editorMode}
            content={content}
            onChange={onChange}
          />
        </div>
      </Container>

      <EditorSwitch
        editorMode={editorMode}
        onChange={handleChangeEditorMode} />
    </>
  )
}
