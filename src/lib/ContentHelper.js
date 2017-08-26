export const makeUrlBase = (content) => {
	if (!content) {
		return ''
	}
	return content.replace(/(['"])\/\//, '$1https://')
}
