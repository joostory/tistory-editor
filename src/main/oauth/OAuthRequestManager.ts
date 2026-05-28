const requestInfo: Record<string, any> = {}

export default class OAuthRequestManager {
  static saveRequestInfo(state: string, info: any): void {
    requestInfo[state] = info
  }

  static loadRequestInfo(state: string): any {
    return requestInfo[state]
  }
}
