import React, { Component, PropTypes } from 'react'
import {Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle} from 'material-ui/Toolbar'
import TextField from 'material-ui/TextField'
import IconButton from 'material-ui/IconButton'
import FlatButton from 'material-ui/FlatButton';
import ActionVisibility from 'material-ui/svg-icons/action/visibility'
import ContentClear from 'material-ui/svg-icons/content/clear'

class EditorToolbar extends Component {
  render() {
    const { title, onTitleChange, onPreviewClick, onSaveClick, onCancelClick } = this.props

    return (
      <Toolbar style={{background:"transparent"}}>
        <ToolbarGroup style={{width:'100%'}}>
          <TextField hintText="Title" type="text" value={title} fullWidth={true} onChange={onTitleChange} />
        </ToolbarGroup>
        <ToolbarGroup lastChild={true}>
          <FlatButton onClick={onSaveClick} label="저장" primary={true} style={{margin:0}} />
          <IconButton onClick={onPreviewClick} tooltip="미리보기"><ActionVisibility /></IconButton>
          <IconButton onClick={onCancelClick}><ContentClear /></IconButton>
        </ToolbarGroup>
      </Toolbar>
    )
  }
}

EditorToolbar.PropTypes = {
  title: PropTypes.string.isRequired,
  onTitleChange: PropTypes.func.isRequired,
  onPreviewClick: PropTypes.func.isRequired,
  onSaveClick: PropTypes.func.isRequired,
  onCancelClick: PropTypes.func.isRequired
}

export default EditorToolbar
