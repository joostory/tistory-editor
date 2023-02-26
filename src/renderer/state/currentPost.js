import { atom } from 'recoil'

export const INITIAL_CURRENT_POST = null

export const currentPostState = atom({
  key: 'currentPost',
  default: INITIAL_CURRENT_POST
})
