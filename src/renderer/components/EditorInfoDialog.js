import React, { Component, PropTypes } from 'react'
import Dialog from 'material-ui/Dialog'
import SelectField from 'material-ui/SelectField'
import MenuItem from 'material-ui/MenuItem'
import TextField from 'material-ui/TextField'
import FlatButton from 'material-ui/FlatButton'

class EditorInfoDialog extends Component {
  render() {
    const { onRequestClose, onRequestSave, onRequestPublish, onTagsChange, onCategoryChange, categories, category, tags, open } = this.props

    let publishDialogActions = [
			<FlatButton label="취소" primary={true} onTouchTap={onRequestClose} />,
			<FlatButton label="저장" primary={true} onTouchTap={onRequestSave} />,
			<FlatButton label="발행" primary={true} keyboardFocused={true} onTouchTap={onRequestPublish} />
		]

    return (
      <Dialog title="글의 속성을 확인해주세요." modal={false} open={open} actions={publishDialogActions}
        onRequestClose={onRequestClose}>

        <TextField floatingLabelText="태그" hintText="Tag" type="text" name="tags" defaultValue={tags} onChange={onTagsChange} />

        <br />

        <SelectField floatingLabelText="카테고리" value={category} autoWidth={true} onChange={onCategoryChange}>
          <MenuItem value="0" primaryText="분류없음" />
          {categories.map((item, i) =>
            <MenuItem key={i} value={item.id} primaryText={item.label} />
          )}
        </SelectField>
      </Dialog>
    )
  }
}

EditorInfoDialog.PropTypes = {
  onRequestClose: PropTypes.func.isRequired,
  onRequestSave: PropTypes.func.isRequired,
  onRequestPublish: PropTypes.func.isRequired,
  onTagsChange: PropTypes.func.isRequired,
  onCategoryChange: PropTypes.func.isRequired,

  categories: PropTypes.array.isRequired,
  category: PropTypes.string.isRequired,
  tags: PropTypes.string.isRequired,
  open: PropTypes.bool.isRequired
}

export default EditorInfoDialog
