import { atom } from 'recoil'

export const INITIAL_PREFERENCES = {}

export const preferencesState = atom({
  key: 'preferences',
  default: INITIAL_PREFERENCES
})
