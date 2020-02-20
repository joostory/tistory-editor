import tistoryLogo from '../images/logo_tistory.png'
import tumblrLogo from '../images/logo_tumblr.png'

class Provider {
  constructor(name, label, logo) {
    this.name = name
    this.label = label
    this.logo = logo
  }
}

export default [
  new Provider('tistory', 'Tistory', tistoryLogo),
  new Provider('tumblr', 'Tumblr', tumblrLogo)
]
