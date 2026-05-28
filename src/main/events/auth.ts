import { ipcMain } from 'electron'
import * as AuthenticationManager from '../lib/AuthenticationManager'
import * as ProviderApiManager from '../lib/ProviderApiManager'

async function fetchAccount(auth: any): Promise<any> {
  const api = ProviderApiManager.getApi(auth.provider)
  return await api.fetchAccount(auth)
}

function fetchAccounts(authList: any[]): Promise<any[]> {
  return Promise.all(authList.map(auth => {
    return fetchAccount(auth)
  }))
}

function saveAuth(auth: any): any {
  AuthenticationManager.add(auth)
  console.log("savedAuth", auth)
  return auth
}

export default function initAuthEvents(): void {
  ipcMain.on('fetch-initial-data', (evt) => {
    console.log('Main.receive: fetch-initial-data')
    const authList = AuthenticationManager.getAll()
    evt.sender.send('initialized', [])
    if (Array.isArray(authList) && authList.length > 0) {
      fetchAccounts(authList)
        .then(data => {
          evt.sender.send('initialized', data)
        })
        .catch(() => {
          evt.sender.send('initialized', [])
        })
    } else {
      evt.sender.send('initialized', [])
    }
  })

  ipcMain.on("request-auth", (evt, provider) => {
    console.log('Main.receive: request-auth', provider)
    const providerApi = ProviderApiManager.getApi(provider)
    providerApi.requestAuth((auth: any) => {
      saveAuth(auth)
      providerApi.fetchAccount(auth)
        .then((account: any) => {
          evt.sender.send('receive-account', account)
        })
      evt.sender.send('request-auth-done')
    }, (e: any) => {
      console.error(e)
      evt.sender.send('receive-message', `오류가 발생했습니다. (${e.message})`)
      evt.sender.send('request-auth-done')
    })
  })

  ipcMain.on("disconnect-auth", (evt, uuid) => {
    console.log('Main.receive: disconnect-auth', uuid)
    AuthenticationManager.removeByUUID(uuid)
    evt.sender.send('complete-disconnect-auth', uuid)
    evt.sender.send('receive-message', '인증해제 했습니다.')
  })
}
