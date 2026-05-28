const tumblr = require('../apis/tumblr-api')

export function getApi(provider: string): any {
  switch (provider) {
    case 'tumblr':
      return tumblr
    default:
      throw new Error(`Unknown provider : ${provider}`)
  }
}
