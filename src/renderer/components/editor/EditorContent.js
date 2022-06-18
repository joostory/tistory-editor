import React, { useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import classnames from 'classnames'

import * as EditorMode from '../../constants/EditorMode'

import Dropzone from 'react-dropzone'
import MarkdownEditor from './codemirror/MarkdownEditor'
import TinymceEditor from './tinymce/TinymceEditor'
import EditorSwitch from './EditorSwich'
import { Container, InputBase } from '@mui/material'

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

function Editor({editorMode, content, onUpload, onOpenFile, onChange}) {
  if (editorMode == EditorMode.TINYMCE) {
    return (
      <TinymceEditor
        value={content}
        onImageHandler={onUpload}
        onOpenFile={onOpenFile}
        onChange={onChange}
      />
    )
  } else {
    return (
      <MarkdownEditor
        value={content}
        onOpenFile={onOpenFile}
        onChange={onChange}
      />
    )
  } 
}

export default function EditorContent({content, onChange, onUpload, title, onTitleChange}) {
  const currentBlog = useSelector(state => state.currentBlog)
	const preferences = useSelector(state => state.preferences)

  const [editorMode, setEditorMode] = useState(preferences.editor || EditorMode.MARKDOWN)

  const dropzoneRef = useRef(null)

	function handleOpenFile() {
		dropzoneRef.current.open()
  }

	function handleChangeEditorMode(selectedMode) {
    setEditorMode(selectedMode)
  }

  return (
    <>
      <Container sx={styles.container} disableGutters={true}>
        <InputBase
          sx={styles.titleInput}
          autoFocus={true}
          fullWidth={true}
          multiline={true}
          placeholder='제목을 입력하세요.'
          value={title}
          onChange={onTitleChange}
        />

        <Dropzone ref={dropzoneRef}
          accept={{"image/*": ['.gif', '.jpg', '.jpeg', '.png']}} 
          onDrop={onUpload}>

          {({getRootProps, getInputProps, isDragActive}) =>
            <div className={classnames('editor_inner', {droppable:isDragActive})} {...getRootProps({
              onClick: e => e.stopPropagation()
            })}>
              <Editor
                editorMode={editorMode}
                content={content}
                currentBlog={currentBlog}
                onChange={onChange}
                onUpload={onUpload}
                onOpenFile={handleOpenFile}
              />

              <input {...getInputProps()} />

              <div className="dropzone_box">
                <b>파일을 넣어주세요.</b>
              </div>
            </div>
          }
        </Dropzone>
      </Container>

      <EditorSwitch
        editorMode={editorMode}
        onChange={handleChangeEditorMode} />
    </>
  )
}
