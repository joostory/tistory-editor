import React, { Component, Fragment, useRef, useState, useEffect, forwardRef } from 'react'
import { connect, useSelector } from 'react-redux'
import classnames from 'classnames'

import * as EditorMode from '../../constants/EditorMode'

import TextareaAutosize from 'react-textarea-autosize'
import Dropzone from 'react-dropzone'
import MarkdownEditor from './codemirror/MarkdownEditor'
import TinymceEditor from './tinymce/TinymceEditor'
import EditorSwitch from './EditorSwich'

function Editor({editorMode, content, currentBlog, onUpload, onOpenFile, onChange}) {

  if (editorMode == EditorMode.TINYMCE) {
    return (
      <TinymceEditor
        value={content}
        currentBlog={currentBlog}
        onImageHandler={onUpload}
        onOpenFile={onOpenFile}
        onChange={onChange}
      />
    )
  } else {
    return (
      <MarkdownEditor
        value={content}
        currentBlog={currentBlog}
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
      <div className="editor">
        <TextareaAutosize
          className='editor-title'
          placeholder='제목을 입력하세요.'
          value={title}
          onChange={onTitleChange}
        />

        <Dropzone ref={dropzoneRef}
          accept="image/*" 
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
      </div>

      <EditorSwitch
        editorMode={editorMode}
        onChange={handleChangeEditorMode} />
    </>
  )
}
