const Oauth2infoReader = require('./Oauth2infoReader')

describe('oauth2info reader', () => {
  test('read google oauth2info', () => {
    let reader = new Oauth2infoReader()
    let target = reader.getGoogle()
    expect(target).not.toBeUndefined()
  })

  test('read tistory oauth2info', () => {
    let reader = new Oauth2infoReader()
    let target = reader.getTistory()
    expect(target).not.toBeUndefined()
  })
})
