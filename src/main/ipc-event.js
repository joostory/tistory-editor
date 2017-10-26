const authEvents = require('./events/auth')
const contentEvents = require('./events/content')
const preferenceEvents = require('./events/preference')
const googlePhotosEvents = require('./events/google-photos')

module.exports.init = () => {
	authEvents()
	contentEvents()
	preferenceEvents()
	googlePhotosEvents()
}
