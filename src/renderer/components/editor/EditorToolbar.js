import React, { Component } from 'react'
import PropTypes from 'prop-types'
import {Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle} from 'material-ui/Toolbar'
import TextField from 'material-ui/TextField'
import IconButton from 'material-ui/IconButton'
import FlatButton from 'material-ui/FlatButton'
import ActionVisibility from 'material-ui/svg-icons/action/visibility'
import NavigationBack from 'material-ui/svg-icons/navigation/arrow-back'

class EditorToolbar extends Component {
  render() {
    const { title, onTitleChange, onSaveClick, onCancelClick } = this.props

    return (
      <Toolbar style={{background:"transparent"}}>
        <ToolbarGroup firstChild={true}>
          <IconButton onClick={onCancelClick}><NavigationBack /></IconButton>
        </ToolbarGroup>
        <ToolbarGroup style={{width:'100%'}}>
          <TextField hintText="Title" type="text" value={title} fullWidth={true} onChange={onTitleChange} />
        </ToolbarGroup>
        <ToolbarGroup lastChild={true}>
          <FlatButton onClick={onSaveClick} label="저장" primary={true} disabled={title.length == 0} style={{margin:0}} />
        </ToolbarGroup>
      </Toolbar>
    )
  }
}

EditorToolbar.propTypes = {
  title: PropTypes.string.isRequired,
  onTitleChange: PropTypes.func.isRequired,
  onSaveClick: PropTypes.func.isRequired,
  onCancelClick: PropTypes.func.isRequired
}

export default EditorToolbar
