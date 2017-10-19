const authEvents = require('./events/auth')
const contentEvents = require('./events/content')
const preferenceEvents = require('./events/preference')

module.exports.init = () => {
	authEvents()
	contentEvents()
	preferenceEvents()
}
