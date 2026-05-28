import { atom } from 'jotai'

interface PostsData {
  page: number
  list: any[]
  hasNext: boolean
}

export const INITIAL_POSTS: PostsData = {
  page: 0,
  list: [],
  hasNext: true
}

export const postsState = atom<PostsData>(INITIAL_POSTS)
export const postsInitializedState = atom<boolean>(false)
export const postsLockState = atom<boolean>(false)
