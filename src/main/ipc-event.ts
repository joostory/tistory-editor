import authEvents from './events/auth'
import contentEvents from './events/content'
import preferenceEvents from './events/preference'
import googleAnalyticsEvents from './events/google-analytics'

export function init(): void {
  authEvents()
  contentEvents()
  preferenceEvents()
  googleAnalyticsEvents()
}
