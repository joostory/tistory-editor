import tumblrLogo from '#/renderer/images/logo_tumblr.png'

class Provider {
  name: string
  label: string
  logo: string

  constructor(name: string, label: string, logo: string) {
    this.name = name
    this.label = label
    this.logo = logo
  }
}

const providers: Provider[] = [
  new Provider('tumblr', 'Tumblr', tumblrLogo)
]

export default providers
