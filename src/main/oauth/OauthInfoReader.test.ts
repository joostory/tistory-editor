import OauthInfoReader from '#/main/oauth/OauthInfoReader'

describe('oauthInfo reader', () => {
  it('read google oauthInfo', () => {
    const reader = new OauthInfoReader()
    const target = reader.getGoogle()
    expect(target).not.toBeUndefined()
  })
})
