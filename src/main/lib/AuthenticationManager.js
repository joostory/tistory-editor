const settings = require('electron-settings')

let initialized = false
let authList = []

function load() {
  if (settings.hasSync('authList')) {
    authList = settings.getSync('authList')  
  }
  authList = authList.filter(auth => auth != null).filter(auth => auth.provider != 'tistory')
  console.log("load authList", authList)
}

function save() {
  settings.setSync('authList', authList)
}

function getAll() {
  if (!initialized) {
    load()
    initialized = true
  }
  return authList
}

function findByUUID(uuid) {
  return getAll().find(auth => auth.uuid == uuid)
}

function removeByUUID(uuid) {
  let list = getAll()
  authList = list.filter(auth => auth.uuid != uuid)
  save()
  return authList
}

function add(auth) {
  let list = getAll()
  list.push(auth)
  authList = list
  save()
}

module.exports = {
  getAll: getAll,
  findByUUID: findByUUID,
  removeByUUID: removeByUUID,
  add: add
}
