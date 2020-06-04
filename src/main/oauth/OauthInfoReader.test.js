const OauthInfoReader = require('./OauthInfoReader')

describe('oauthInfo reader', () => {
  it('read google oauthInfo', () => {
    let reader = new OauthInfoReader()
    let target = reader.getGoogle()
    expect(target).not.toBeUndefined()
  })

  it('read tistory oauthInfo', () => {
    let reader = new OauthInfoReader()
    let target = reader.getTistory()
    expect(target).not.toBeUndefined()
  })
})
