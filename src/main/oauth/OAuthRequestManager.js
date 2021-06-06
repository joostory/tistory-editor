
const requestInfo = []

class OAuthRequestManager {
  static saveRequestInfo(state, info) {
    requestInfo[state] = info
  }

  static loadRequestInfo(state) {
    return requestInfo[state]
  }
}

module.exports = OAuthRequestManager
