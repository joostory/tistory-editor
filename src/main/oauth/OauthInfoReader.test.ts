import OauthInfoReader from '#/main/oauth/OauthInfoReader'

describe('oauthInfo reader', () => {
  it('read oauthInfo', () => {
    const reader = new OauthInfoReader()
    const target = reader.getTumblr()
    expect(target).not.toBeUndefined()
  })
})
