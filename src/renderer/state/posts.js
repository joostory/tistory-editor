import { atom } from 'recoil'

export const INITIAL_POSTS = {
	page: 0,
	list: [],
	hasNext: true
}

export const postsState = atom({
  key: 'posts',
  default: INITIAL_POSTS
})

export const postsInitializedState = atom({
  key: 'postsInitialized',
  default: false
})

export const postsLockState = atom({
  key: 'postsLock',
  default: false
})
