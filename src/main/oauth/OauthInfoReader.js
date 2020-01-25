const fs = require('fs')
const path = require('path')

class OauthInfoReader {

  constructor() {
    let data = ''
    if (fs.existsSync(path.join(__dirname, "../../../.oauthInfo.json"))) {
      data = fs.readFileSync(path.join(__dirname, "../../../.oauthInfo.json"), 'utf8')
    } else if (fs.existsSync(path.join(__dirname, "../../../oauthInfo.json"))) {
      data = fs.readFileSync(path.join(__dirname, "../../../oauthInfo.json"), 'utf8')
    } else {
      throw new Exception('NO OAUTHINFO')
    }

    this.oauthInfo = JSON.parse(data)
  }

  getGoogle() {
    if (!this.oauthInfo.google) {
      throw new Exception('NO GOOGLE OAUTHINFO')
    }
    return this.oauthInfo.google
  }

  getTistory() {
    if (!this.oauthInfo.tistory) {
      throw new Exception('NO TISTORY OAUTHINFO')
    }
    return this.oauthInfo.tistory
  }

  getTumblr() {
    if (!this.oauthInfo.tumblr) {
      throw new Exception('NO TUMBLR OAUTHINFO')
    }
    return this.oauthInfo.tumblr
  }
}

module.exports = OauthInfoReader
