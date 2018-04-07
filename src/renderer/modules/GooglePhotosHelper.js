export const toOriginalUrl = url => {
  const index = url.lastIndexOf('/')
  return url.slice(0, index) + "/s0" + url.slice(index)
}