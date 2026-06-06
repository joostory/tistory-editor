import React from 'react'
import TiptapEditor from '#/renderer/components/editor/tiptap/TiptapEditor'
import { Container, InputBase } from '@mui/material'
import { useAtomValue } from 'jotai'
import { currentAuthState } from '#/renderer/state/currentBlog'
import { Auth } from '#/renderer/types'

const styles = {
  container: {
    width: 700,
    paddingTop: (theme: any) => theme.spacing(3),
    paddingLeft: (theme: any) => theme.spacing(4),
    paddingRight: (theme: any) => theme.spacing(4),
    paddingBottom: (theme: any) => theme.spacing(5),
    backgroundColor: '#fff',
    boxShadow: (theme: any) => theme.shadows[1],
    borderRadius: (theme: any) => theme.spacing(2)
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

      <TiptapEditor
        value={content}
        onChange={onChange}
      />
    </Container>
  )
}
