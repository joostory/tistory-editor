import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { Toolbar, TextField, IconButton, Button } from '@material-ui/core'
import { NavigateBefore } from '@material-ui/icons'

class EditorToolbar extends Component {
  render() {
    const { title, onTitleChange, onSaveClick, onCancelClick } = this.props

    return (
      <Toolbar className='editor-header'>
        <IconButton onClick={onCancelClick}><NavigateBefore /></IconButton>
        <TextField placeholder="Title" type="text" value={title} fullWidth={true} onChange={onTitleChange} />
        <Button className='btn' variant='text' onClick={onSaveClick} disabled={title.length == 0}>
          저장
        </Button>
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
