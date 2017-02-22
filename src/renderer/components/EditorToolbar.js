import React, { Component, PropTypes } from 'react'
import {Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle} from 'material-ui/Toolbar'
import TextField from 'material-ui/TextField'
import IconButton from 'material-ui/IconButton'
import ActionSwapVert from 'material-ui/svg-icons/action/swap-vert'
import ActionDone from 'material-ui/svg-icons/action/done'
import ContentClear from 'material-ui/svg-icons/content/clear'

class EditorToolbar extends Component {
  render() {
    const { title, onTitleChange, onChangeEditorMode, onSaveClick, onCancelClick } = this.props

    return (
      <Toolbar style={{background:"transparent"}}>
        <ToolbarGroup style={{width:'100%'}}>
          <TextField hintText="Title" type="text" value={title} fullWidth={true} onChange={onTitleChange} />
        </ToolbarGroup>
        <ToolbarGroup lastChild={true}>
          <IconButton onClick={onChangeEditorMode}><ActionSwapVert /></IconButton>
          <IconButton onClick={onSaveClick}><ActionDone /></IconButton>
          <IconButton onClick={onCancelClick}><ContentClear /></IconButton>
        </ToolbarGroup>
      </Toolbar>
    )
  }
}

EditorToolbar.PropTypes = {
  title: PropTypes.string.isRequired,
  onTitleChange: PropTypes.func.isRequired,
  onChangeEditorMode: PropTypes.func.isRequired,
  onSaveClick: PropTypes.func.isRequired,
  onCancelClick: PropTypes.func.isRequired
}

export default EditorToolbar
