import React from 'react'
import TiptapEditor from './tiptap/TiptapEditor'
import { Container, InputBase } from '@mui/material'
import { useAtomValue } from 'jotai'
import { currentAuthState } from '../../state/currentBlog'
import { Auth } from '../../types'

const styles = {
  container: {
    width: 700,
    padding: '0 50px',
    backgroundColor: '#fff',
    boxShadow: (theme: any) => theme.shadows[1],
    borderRadius: (theme: any) => theme.spacing(0.5)
  },
  titleInput: {
    marginTop: (theme: any) => theme.spacing(4),
    fontSize: (theme: any) => theme.spacing(4),
    color: '#333'
  }
}

interface EditorContentProps {
  content: any;
  onChange: (value: any) => void;
  title: string;
  onTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function EditorContent({ content, onChange, title, onTitleChange }: EditorContentProps) {
  const currentAuth = useAtomValue(currentAuthState) as Auth

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
