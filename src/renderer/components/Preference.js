import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { ipcRenderer } from 'electron'
import autobind from 'autobind-decorator'
import Dialog from 'material-ui/Dialog'
import SelectField from 'material-ui/SelectField'
import FlatButton from 'material-ui/FlatButton'
import { RadioButton, RadioButtonGroup } from 'material-ui/RadioButton'

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

    let actions = [
      <FlatButton label="닫기" primary={true} onTouchTap={this.handlePreferenceClose} />,
    ]

    let defaultEditor = preferences.editor || EditorMode.MARKDOWN

    return (
      <Dialog title="환경설정" modal={false} open={open} actions={actions} onRequestClose={this.handlePreferenceClose}>
        기본 에디터
        <RadioButtonGroup name="editor" defaultSelected={defaultEditor} onChange={this.handleChangeEditor}>
          <RadioButton value={EditorMode.MARKDOWN} label="Markdown Editor" />
          <RadioButton value={EditorMode.QUILL} label="Rich Editor (Quill)" />
          <RadioButton value={EditorMode.TINYMCE} label="Rich Editor (TinyMCE)" />
        </RadioButtonGroup>
      </Dialog>
    )
  }
}

Preference.propTypes = {
  preferences: PropTypes.object
}

export default Preference
