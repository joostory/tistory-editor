const uuid = require('uuid').v4
const { ipcMain } = require('electron')
const AuthenticationManager = require('../lib/AuthenticationManager')
const ProviderApiManager = require('../lib/ProviderApiManager')
const OAuthRequestManager = require('../oauth/OAuthRequestManager');

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
  console.log("savedAuth", auth)
  return auth
}

module.exports = () => {
  ipcMain.on('fetch-initial-data', (evt) => {
    console.log('Main.receive: fetch-initial-data')
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
    console.log('Main.receive: request-auth', provider)
    let providerApi = ProviderApiManager.getApi(provider)
    let state = providerApi.requestAuth()
    OAuthRequestManager.saveRequestInfo(state, (code) => {
      const providerApi = ProviderApiManager.getApi(provider)
      providerApi.requestToken(code)
        .then(data => {
          if (data.error) {
            throw new Error(`${data.error}: ${data.error_description}`)
          }

          return {
            uuid: uuid(),
            provider: provider,
            authInfo: data
          }
        })
        .then(saveAuth)
        .then(auth => {
          providerApi.fetchAccount(auth)
            .then(account => {
              evt.sender.send('receive-account', account)
            })
        })
        .catch(e => {
          console.error(e)
          evt.sender.send('receive-message', `오류가 발생했습니다. (${e.message})`)
        })
    })
  })

  ipcMain.on("disconnect-auth", (evt, uuid) => {
    console.log('Main.receive: disconnect-auth', uuid)
    AuthenticationManager.removeByUUID(uuid)
    evt.sender.send('complete-disconnect-auth', uuid)
    evt.sender.send('receive-message', '인증해제 했습니다.')
  })
}
