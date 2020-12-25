import dayjs from 'dayjs'

export const makeUrlBase = (content) => {
	if (!content) {
		return ''
	}
	return content.replace(/(['"])\/\//, '$1https://')
}

export const unixtimstampToDate = (timestamp) => {
	try {
    const date = timestamp? new Date(parseInt(timestamp)) : new Date()
    return dayjs(date).format('YYYY-MM-DD')
	} catch (e) {
		console.error(timestamp, e)
		return ''
	}
}

export const timestampsToDate = (timestamps) => {
	try {
    const date = timestamps? new Date(timestamps) : new Date()
    return dayjs(date).format('YYYY-MM-DD')
	} catch (e) {
		console.error(timestamps, e)
		return ''
	}
}
