
class Visibility {

	constructor(value) {
		this.value = value
		this.name = this.toString()
	}

	toString() {
		switch(this.value) {
			case "2":
			case "3":
				return "발행"
			default:
				return "저장"
		}
	}
}

export default Visibility
