import React, { Component, Fragment } from 'react'
import autobind from 'autobind-decorator'

import * as EditorMode from '../../constants/EditorMode'

import { Popover, Menu, MenuItem, Button } from '@material-ui/core'
import { SwapVert } from '@material-ui/icons'

class EditorSwitch extends Component {

  constructor(props, context) {
    super(props, context)
    this.state = {
      open: false,
      popoverParent: null
    }
  }

  @autobind
	handleOpenEditorMode(e) {
		e.preventDefault()
		this.setState({
			open: true,
			popoverParent: e.currentTarget
		})
  }
  
  @autobind
	handleCloseEditorMode(e) {
		this.setState({
      open: false,
      popoverParent: null
		})
  }
  
  @autobind
  handleChangeEditorMode(editorMode) {
    const { onChange } = this.props
    this.handleCloseEditorMode()
    onChange(editorMode)
  }

  render() {
    const { open, popoverParent } = this.state
    const { editorMode } = this.props

    return (
      <Fragment>
        <Button variant='fab' className="btn_change_editor" mini={true} onClick={this.handleOpenEditorMode}>
					<SwapVert />
				</Button>

				<Popover open={open}
					anchorEl={popoverParent}
					anchorOrigin={{horizontal: 'right', vertical: 'top'}}
					targetOrigin={{horizontal: 'right', vertical: 'bottom'}}
					onRequestClose={this.handleCloseEditorMode}>
					<Menu>
						<MenuItem primaryText="Rich Editor (Quill)" checked={editorMode === EditorMode.QUILL}
							onClick={e => this.handleChangeEditorMode(EditorMode.QUILL)} />
						<MenuItem primaryText="Rich Editor (Tinymce)" checked={editorMode === EditorMode.TINYMCE}
							onClick={e => this.handleChangeEditorMode(EditorMode.TINYMCE)} />
						<MenuItem primaryText="Markdown Editor" checked={editorMode === EditorMode.MARKDOWN}
							onClick={e => this.handleChangeEditorMode(EditorMode.MARKDOWN)} />
					</Menu>
				</Popover>
      </Fragment>
    )
  }
}

export default EditorSwitch
