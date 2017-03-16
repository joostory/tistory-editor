import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { ipcRenderer } from 'electron'
import Dialog from 'material-ui/Dialog'
import SelectField from 'material-ui/SelectField'
import FlatButton from 'material-ui/FlatButton'
import { RadioButton, RadioButtonGroup } from 'material-ui/RadioButton'

import * as EditorMode from '../constants/EditorMode'

class Preference extends Component {

  constructor(props, context) {
    super(props, context)
    this.state = {
      open: false
    }
    this.handlePreferenceOpen = this.handlePreferenceOpen.bind(this)
    this.handlePreferenceClose = this.handlePreferenceClose.bind(this)
    this.handleChangeEditor = this.handleChangeEditor.bind(this)
  }

  componentWillMount() {
    ipcRenderer.on("open-preference", this.handlePreferenceOpen)
  }

  componentWillUnmount() {
    ipcRenderer.removeListener("open-preference", this.handlePreferenceOpen)
  }

  handlePreferenceOpen() {
    this.setState({
      open: true
    })
  }

  handlePreferenceClose() {
    this.setState({
      open: false
    })
  }

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
          <RadioButton value={EditorMode.QUILL} label="Rich Editor" />
        </RadioButtonGroup>
      </Dialog>
    )
  }
}

Preference.propTypes = {
  preferences: PropTypes.object.isRequired
}

const mapStateToProps = (state) => {
  return {
		preferences: state.preferences
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch: dispatch
  }
}

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(Preference)
