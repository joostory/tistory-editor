import Analytics from 'electron-ga'
import uuidV4 from 'uuid/v4'

const clientID = uuidV4()
const analytics = new Analytics('UA-26767980-11', {
  userId: clientID
})

export const pageview = (page, pageTitle) => {
	if (process.env.NODE_ENV !== 'production') {
		return
  }
  
  return analytics.send('pageview', {
    dl: encodeURIComponent(page),
    dt: pageTitle
  })
}

