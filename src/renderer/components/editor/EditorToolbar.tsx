import React from 'react'
import { Toolbar, Button } from '@mui/material'

const styles = {
  root: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    height: (theme: any) => theme.spacing(8),
    zIndex: 10
  }
}

interface EditorToolbarProps {
  onSaveClick: () => void;
  onCancelClick: () => void;
  disabled?: boolean;
}

export default function EditorToolbar({ onSaveClick, onCancelClick, disabled = false }: EditorToolbarProps) {
  return (
    <Toolbar sx={styles.root}>
      <Button onClick={onCancelClick}>
        취소
      </Button>

      <div style={{ flexGrow: 1 }} />
      
      <Button variant='contained' color='primary' onClick={onSaveClick} disabled={disabled}>
        완료
      </Button>
    </Toolbar>
  )
}
