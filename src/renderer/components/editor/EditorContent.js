import React, { Component } from 'react'
import autobind from 'autobind-decorator'
import classnames from 'classnames'

import * as EditorMode from '../../constants/EditorMode'

import Dropzone from 'react-dropzone'
import MarkdownEditor from './codemirror/MarkdownEditor'
import QuillEditor from './quill/QuillEditor'
import TinymceEditor from './tinymce/TinymceEditor'

class EditorContent extends Component {

  @autobind
	handleOpenFile() {
		const { dropzone } = this.refs
		dropzone.open()
  }
  
  getContent() {
    return this.refs.editor.getContent()
  }

  getEditor() {
		const { currentBlog, content, editorMode, onUpload } = this.props

		if (editorMode == EditorMode.QUILL) {
			return <QuillEditor ref="editor" value={content} currentBlog={currentBlog} onImageHandler={onUpload} />
		} else if (editorMode == EditorMode.TINYMCE) {
			return <TinymceEditor ref="editor" value={content} currentBlog={currentBlog} onImageHandler={onUpload} onOpenFile={this.handleOpenFile} />
		} else {
			return <MarkdownEditor ref="editor" value={content} currentBlog={currentBlog} onOpenFile={this.handleOpenFile} />
		}
	}

  render() {
    const { uploading, onUpload, uploadMessage } = this.props
    return (
      <div className="editor">
        <Dropzone ref='dropzone' disableClick={true} accept="image/*" className={classnames({droppable: uploading})} activeClassName="droppable" style={{width: "100%",height:"100%"}}
          onDrop={onUpload}>

          {this.getEditor()}

          <div className="dropzone_box">
            <b>{uploadMessage}</b>
          </div>

        </Dropzone>
      </div>
    )
  }
}

export default EditorContent