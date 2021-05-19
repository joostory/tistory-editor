const authEvents = require('./events/auth')
const contentEvents = require('./events/content')
const preferenceEvents = require('./events/preference')
const googlePhotosEvents = require('./events/google-photos')
const googleAnalyticsEvents = require('./events/google-analytics')

module.exports.init = () => {
	authEvents()
	contentEvents()
	preferenceEvents()
	googlePhotosEvents()
  googleAnalyticsEvents()
}
