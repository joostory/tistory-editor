import Analytics from 'electron-google-analytics'
import uuidV4 from 'uuid/v4'

const clientID = uuidV4()
const analytics = new Analytics('UA-26767980-11')

export const pageview = (page, pageTitle) => {
	if (process.env.NODE_ENV !== 'production') {
		return
	}

	return analytics
	.pageview('http://tistory-editor.joostory.net', page, pageTitle, clientID)
	.then((response) => {
    return response
  }).catch((err) => {
    return err
	})
}

export const event = (category, action) => {
	if (process.env.NODE_ENV !== 'production') {
		return
	}
	
	return analytics
	.event(category, action, { clientID })
	.then((response) => {
    return response
  }).catch((err) => {
    return err
	})
}

