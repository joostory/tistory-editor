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
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      content: nextProps.content
    })
  }

  @autobind
	handleOpenFile() {
		const { dropzone } = this.refs
		dropzone.open()
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
    return this.refs.editor.getContent()
  }

  getEditor() {
    const { currentBlog, onUpload } = this.props
    const { editorMode, content } = this.state

		if (editorMode == EditorMode.TINYMCE) {
			return <TinymceEditor ref="editor" value={content} currentBlog={currentBlog} onImageHandler={onUpload} onOpenFile={this.handleOpenFile} />
		} else {
			return <MarkdownEditor ref="editor" value={content} currentBlog={currentBlog} onOpenFile={this.handleOpenFile} />
		}
	}

  render() {
    const { uploading, onUpload, uploadMessage } = this.props
    const { editorMode } = this.state
    return (
      <Fragment>
        <div className="editor">
          <Dropzone ref='dropzone' disableClick={true} accept="image/*" className={classnames({droppable: uploading})} activeClassName="droppable" style={{width: "100%",height:"100%"}}
            onDrop={onUpload}>

            {this.getEditor()}

            <div className="dropzone_box">
              <b>{uploadMessage}</b>
            </div>

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
