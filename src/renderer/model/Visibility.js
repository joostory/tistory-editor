import React from 'react'
import ContentDrafts from 'material-ui/svg-icons/content/drafts'

class Visibility {

	constructor(value) {
		this.value = Number.parseInt(value)
		this.name = this.toString()
	}

	toString() {
		switch(this.value) {
			case 2:
			case 3:
				return "발행"
			default:
				return "저장"
		}
	}

	toMaterialIcon() {
		switch(this.value) {
			case 2:
			case 3:
				return
			default:
				return <ContentDrafts />
		}
	}
}

export default Visibility
