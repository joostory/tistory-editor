const OauthInfoReader = require('./OauthInfoReader')

describe('oauthInfo reader', () => {
  test('read google oauthInfo', () => {
    let reader = new OauthInfoReader()
    let target = reader.getGoogle()
    expect(target).not.toBeUndefined()
  })

  test('read tistory oauthInfo', () => {
    let reader = new OauthInfoReader()
    let target = reader.getTistory()
    expect(target).not.toBeUndefined()
  })
})
