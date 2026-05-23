import React from 'react'
import TiptapEditor from './tiptap/TiptapEditor'
import { Container, InputBase } from '@mui/material'
import { useAtomValue } from 'jotai'
import { currentAuthState } from '../../state/currentBlog'

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

export default function EditorContent({content, onChange, title, onTitleChange}) {
  const currentAuth = useAtomValue(currentAuthState)

  return (
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
        <TiptapEditor
          value={content}
          onChange={onChange}
        />
      </div>
    </Container>
  )
}

