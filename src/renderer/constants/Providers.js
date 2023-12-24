import tumblrLogo from '../images/logo_tumblr.png'

class Provider {
  constructor(name, label, logo) {
    this.name = name
    this.label = label
    this.logo = logo
  }
}

export default [
  new Provider('tumblr', 'Tumblr', tumblrLogo)
]
