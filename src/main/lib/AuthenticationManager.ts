import * as settings from 'electron-settings'

let initialized = false
let authList: any[] = []

function load() {
  if (settings.hasSync('authList')) {
    authList = settings.getSync('authList') as any[]
  }
  authList = authList.filter(auth => auth != null)
  console.log("load authList", authList)
}

function save() {
  settings.setSync('authList', authList as any)
}

export function getAll(): any[] {
  if (!initialized) {
    load()
    initialized = true
  }
  return authList
}

export function findByUUID(uuid: string): any {
  return getAll().find(auth => auth.uuid === uuid)
}

export function removeByUUID(uuid: string): any[] {
  const list = getAll()
  authList = list.filter(auth => auth.uuid !== uuid)
  save()
  return authList
}

export function add(auth: any): void {
  const list = getAll()
  list.push(auth)
  authList = list
  save()
}
