const uuid = require('uuid').v4
const { ipcMain } = require('electron')
const AuthenticationManager = require('../lib/AuthenticationManager')
const ProviderApiManager = require('../lib/ProviderApiManager')

async function fetchAccount(auth) {
  const api = ProviderApiManager.getApi(auth.provider)
  return await api.fetchAccount(auth)
}

function fetchAccounts(authList) {
  return Promise.all(authList.map(auth => {
    return fetchAccount(auth)
  }))
}

function saveAuth(auth) {
  AuthenticationManager.add(auth)
  return auth
}

module.exports = () => {
  ipcMain.on('fetch-initial-data', (evt) => {
    let authList = AuthenticationManager.getAll()
    if (Array.isArray(authList) && authList.length > 0) {
      fetchAccounts(authList).then(data => {
        evt.sender.send('initialized', data)
      })
    } else {
      evt.sender.send('initialized', [])
    }
  })

  ipcMain.on("request-auth", (evt, provider) => {
    let providerApi = ProviderApiManager.getApi(provider)
    providerApi.getAccessToken()
      .then(authInfo => ({
        uuid: uuid(),
        provider: provider,
        authInfo: authInfo
      }))
      .then(auth => saveAuth(auth))
      .then(auth => {
        fetchAccount(auth)
          .then(account => {
            evt.sender.send('receive-account', account)
          })
      })
  })

  ipcMain.on("disconnect-auth", (evt, uuid) => {
    AuthenticationManager.removeByUUID(uuid)
    evt.sender.send('complete-disconnect-auth', uuid)
    evt.sender.send('receive-message', '인증해제 했습니다.')
  })
}
