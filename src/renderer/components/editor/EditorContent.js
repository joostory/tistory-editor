import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import autobind from 'autobind-decorator'
import classnames from 'classnames'

import * as EditorMode from '../../constants/EditorMode'

import Dropzone from 'react-dropzone'
import MarkdownEditor from './codemirror/MarkdownEditor'
import TinymceEditor from './tinymce/TinymceEditor'
import EditorSwitch from './EditorSwich'

@connect(state => ({
	currentBlog: state.currentBlog,
	preferences: state.preferences
}), dispatch => ({}), null, {
  forwardRef: true
})
class EditorContent extends Component {

  constructor(props, context) {
    super(props, context)
    this.state = {
      editorMode: props.preferences.editor || EditorMode.MARKDOWN,
      content: props.content
    }

    this.editorRef = React.createRef()
    this.dropzoneRef = React.createRef()
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      content: nextProps.content
    })
  }

  @autobind
	handleOpenFile() {
		this.dropzoneRef.current.open()
  }

  @autobind
	handleChangeEditorMode(selectedMode) {
    const { onChange } = this.props
		this.setState({
			editorMode: selectedMode
    })
    onChange(this.getContent())
	}
  
  getContent() {
    return this.editorRef.current.getContent()
  }

  getEditor() {
    const { currentBlog, onUpload } = this.props
    const { editorMode, content } = this.state

		if (editorMode == EditorMode.TINYMCE) {
			return <TinymceEditor ref={this.editorRef} value={content} currentBlog={currentBlog} onImageHandler={onUpload} onOpenFile={this.handleOpenFile} />
		} else {
			return <MarkdownEditor ref={this.editorRef} value={content} currentBlog={currentBlog} onOpenFile={this.handleOpenFile} />
		}
	}

  render() {
    const { onUpload } = this.props
    const { editorMode } = this.state
    return (
      <Fragment>
        <div className="editor">
          <Dropzone ref={this.dropzoneRef}
            accept="image/*" 
            onDrop={onUpload}>

            {({getRootProps, getInputProps, isDragActive}) =>
              <div className={classnames('editor_inner', {droppable:isDragActive})} {...getRootProps({
                onClick: e => e.preventDefault()
              })}>
                {this.getEditor()}

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
					onChange={this.handleChangeEditorMode} />
      </Fragment>
    )
  }
}

export default EditorContent
