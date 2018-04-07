import { toOriginalUrl } from './GooglePhotosHelper'

test('toOriginalUrl', () => {
  const url = "https://lh3.googleusercontent.com/-bn7fXhCl9pQ/WrCL8EhHs1I/AAAAAAAAdEE/fT1wNW70x-842eV6SljYqAFDNK64E7CbgCHMYBhgL/IMG_5860.JPG"
  const expected = "https://lh3.googleusercontent.com/-bn7fXhCl9pQ/WrCL8EhHs1I/AAAAAAAAdEE/fT1wNW70x-842eV6SljYqAFDNK64E7CbgCHMYBhgL/s0/IMG_5860.JPG"

  expect(toOriginalUrl(url)).toBe(expected)
})
