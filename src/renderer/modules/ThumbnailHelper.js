
function isThumbnail(url) {
  return url && url.indexOf('daumcdn.net/thumb') > 0
}

export function makeThumbnail(type, url) {
  if (!url) {
    return url
  }

  if (isThumbnail(url)) {
    return url.replace(/daumcdn.net\/thumb\/([^/]*x[^/]*)/, `daumcdn.net/thumb/${type}`)
  }

  return `https://img1.daumcdn.net/thumb/${type}/?scode=mtistory2&fname=${encodeURIComponent(url)}`
}

