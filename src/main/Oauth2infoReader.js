const fs = require('fs')
const path = require('path')

class Oauth2infoReader {

  constructor() {
    let data = ''
    if (fs.existsSync(path.join(__dirname, "../../.oauth2info.json"))) {
      data = fs.readFileSync(path.join(__dirname, "../../.oauth2info.json"), 'utf8')
    } else if (fs.existsSync(path.join(__dirname, "../../oauth2info.json"))) {
      data = fs.readFileSync(path.join(__dirname, "../../oauth2info.json"), 'utf8')
    } else {
      throw new Exception('NO OAUTH2INFO')
    }

    this.oauth2info = JSON.parse(data)
  }

  getGoogle() {
    if (!this.oauth2info.google) {
      throw new Exception('NO GOOGLE OAUTH2INFO')
    }
    return this.oauth2info.google
  }

  getTistory() {
    if (!this.oauth2info.tistory) {
      throw new Exception('NO TISTORY OAUTH2INFO')
    }
    return this.oauth2info.tistory
  }
}

module.exports = Oauth2infoReader
