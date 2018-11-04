import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { ipcRenderer } from 'electron'
import autobind from 'autobind-decorator'

import { Dialog, Button, DialogTitle, DialogContent, DialogActions, RadioGroup, Radio, FormControlLabel } from '@material-ui/core'

import * as EditorMode from '../constants/EditorMode'

@connect(state => ({
	preferences: state.preferences
}), dispatch => ({}))
class Preference extends Component {

  constructor(props, context) {
    super(props, context)
    this.state = {
      open: false
    }
	}
	
  componentWillMount() {
    ipcRenderer.on("open-preference", this.handlePreferenceOpen)
  }

  componentWillUnmount() {
    ipcRenderer.removeListener("open-preference", this.handlePreferenceOpen)
  }

	@autobind
  handlePreferenceOpen() {
    this.setState({
      open: true
    })
  }

	@autobind
  handlePreferenceClose() {
    this.setState({
      open: false
    })
  }

	@autobind
  handleChangeEditor(e, value) {
    const { preferences } = this.props
    let savePreferences = Object.assign({}, preferences, {
      editor: value
    })
    ipcRenderer.send("save-preferences", savePreferences)
  }

  render() {
    const { open } = this.state
    const { preferences } = this.props

    let defaultEditor = preferences.editor || EditorMode.MARKDOWN

    return (
      <Dialog open={open} onClose={this.handlePreferenceClose}>
        <DialogTitle>환경설정</DialogTitle>

        <DialogContent>
          기본 에디터
          <RadioGroup name="editor" value={defaultEditor} onChange={this.handleChangeEditor}>
            <FormControlLabel value={EditorMode.MARKDOWN} label="Markdown Editor" control={<Radio />} />
            <FormControlLabel value={EditorMode.QUILL} label="Rich Editor (Quill)" control={<Radio />} />
            <FormControlLabel value={EditorMode.TINYMCE} label="Rich Editor (TinyMCE)" control={<Radio />} />
          </RadioGroup>
        </DialogContent>

        <DialogActions>
          <Button variant='text' onClick={this.handlePreferenceClose}>닫기</Button>
        </DialogActions>
      </Dialog>
    )
  }
}

Preference.propTypes = {
  preferences: PropTypes.object
}

export default Preference
