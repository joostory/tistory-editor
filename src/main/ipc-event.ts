import authEvents from '#/main/events/auth'
import contentEvents from '#/main/events/content'
import preferenceEvents from '#/main/events/preference'
import googleAnalyticsEvents from '#/main/events/google-analytics'
import themeEvents from '#/main/events/theme'
import aboutEvents from '#/main/events/about'

export function init(): void {
  authEvents()
  contentEvents()
  preferenceEvents()
  googleAnalyticsEvents()
  themeEvents()
  aboutEvents()
}
