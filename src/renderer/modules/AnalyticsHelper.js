import Analytics from 'electron-ga'
import { v4 as uuid } from 'uuid'

const clientID = uuid()
const analytics = new Analytics('UA-26767980-11', {
  userId: clientID
})

export const pageview = (page, pageTitle) => {
	if (process.env.NODE_ENV !== 'production') {
    console.log('PageView', page, pageTitle)
		return
  }
  
  return analytics.send('pageview', {
    dl: encodeURIComponent(page),
    dt: pageTitle
  })
}

