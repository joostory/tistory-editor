import React, { useEffect, useMemo } from 'react'
import { createEditor } from '@editablejs/models'
import { withEditable, EditableProvider, ContentEditable } from '@editablejs/editor'
import { withPlugins, MarkEditor } from '@editablejs/plugins'
import { withToolbar, ToolbarComponent, Toolbar } from '@editablejs/plugin-toolbar'
import { Box } from '@mui/material'

const styles = {
  toolbar: {
    position: 'fixed',
    top:15,
    width:700,
    display: 'flex',
    alignItems: 'center',
    borderRadius:(theme) => 1,
    paddingLeft:(theme) => theme.spacing(0.5),
    height:(theme) => theme.spacing(5),
    left: '50%',
    transform: 'translate(-50%,0)',
    zIndex:10,
    background:(theme) => theme.palette.headerBackground,
    boxShadow:(theme) => theme.shadows[1]
  },
  toolbarBtn: {
    padding: '5px',
    minWidth: '34px',
    height: '34px'
  },
  editor: {
    color: '#333',
    height: 'auto',
    background: 'transparent',
    padding: '30px 0 70px',
    outline: 'none'
  }
}

const marks = ['bold', 'italic', 'underline', 'strikethrough', 'code', 'sub', 'sup']


export default function EditablejsEditor() {
  const editor = useMemo(() => {
    let editor = withEditable(createEditor())
    editor = withPlugins(editor)
    editor = withToolbar(editor)
    return editor
  }, [])

  function handleChange(data) {
    console.log("content", data)
  }

  useEffect(() => {
    const items = marks.map(mark => ({
      type: 'button',
      children: mark,
      active: MarkEditor.isActive(editor, mark),
      onToggle: () => {
        MarkEditor.toggle(editor, mark)
      }
    }))
    Toolbar.setItems(editor, items)
  }, [editor])

  return (
    <EditableProvider editor={editor} onChange={handleChange}>
      <Box sx={styles.toolbar}>
        <ToolbarComponent
          editor={editor}
        />
      </Box>

      <Box sx={styles.editor}>
        <ContentEditable
          lang='ko-KR'
          placeholder="내용을 입력하세요."
          style={{minHeight: 640}}
        />
      </Box>
    </EditableProvider>
  )
}
