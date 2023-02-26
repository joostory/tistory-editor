import { atom } from 'recoil'

export const initializedStatusState = atom({
  key: 'initializedStatus',
  default: false
})

export const fetchUserStatusState = atom({
  key: 'fetchUserStatus',
  default: false
})
