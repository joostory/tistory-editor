const authEvents = require('./events/auth')
const contentEvents = require('./events/content')
const preferenceEvents = require('./events/preference')
const googleAnalyticsEvents = require('./events/google-analytics')

module.exports.init = () => {
	authEvents()
	contentEvents()
	preferenceEvents()
  googleAnalyticsEvents()
}
