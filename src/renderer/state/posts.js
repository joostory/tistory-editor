import { atom } from 'jotai'

export const INITIAL_POSTS = {
	page: 0,
	list: [],
	hasNext: true
}

export const postsState = atom(
  
   INITIAL_POSTS
)

export const postsInitializedState = atom(
  
   false
)

export const postsLockState = atom(
  
   false
)
