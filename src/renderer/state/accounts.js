import { atom } from 'recoil'

export const INITIAL_ACCOUNTS = []

export const accountsState = atom({
  key: 'accounts',
  default: INITIAL_ACCOUNTS
})
