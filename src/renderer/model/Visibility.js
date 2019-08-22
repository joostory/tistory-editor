import React from 'react'
import { Drafts } from '@material-ui/icons'

class Visibility {

	constructor(value) {
		this.value = Number.parseInt(value)
		this.name = this.toString()
	}

	toString() {
		switch(this.value) {
			case 2:
			case 3:
			case 20:
				return "발행"
			default:
				return "저장"
		}
	}

	toMaterialIcon() {
		switch(this.value) {
			case 2:
			case 3:
			case 20:
				return
			default:
				return <Drafts />
		}
	}
}

export default Visibility
