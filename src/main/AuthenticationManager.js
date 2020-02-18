const settings = require('electron-settings')

let authList = null

function load() {
  authList = settings.get('authList', [])
}

function save() {
  settings.set('authList', authList)
}

function getAll() {
  if (!authList) {
    load()
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
