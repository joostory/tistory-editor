import * as fs from 'fs'
import * as path from 'path'

export default class OauthInfoReader {
  oauthInfo: any

  constructor() {
    let data = ''
    if (fs.existsSync(path.join(__dirname, "../../../.oauthInfo.json"))) {
      data = fs.readFileSync(path.join(__dirname, "../../../.oauthInfo.json"), 'utf8')
    } else if (fs.existsSync(path.join(__dirname, "../../../oauthInfo.json"))) {
      data = fs.readFileSync(path.join(__dirname, "../../../oauthInfo.json"), 'utf8')
    } else {
      throw new Error('NO OAUTHINFO')
    }

    this.oauthInfo = JSON.parse(data)
  }

  getTumblr(): any {
    if (!this.oauthInfo.tumblr) {
      throw new Error('NO TUMBLR OAUTHINFO')
    }
    return this.oauthInfo.tumblr
  }
}
