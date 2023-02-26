import { atom } from 'recoil'

export const INITIAL_CURRENT_AUTH = null
export const INITIAL_CURRENT_BLOG = null
export const INITIAL_CATEGORIES = []

export const currentAuthState = atom({
  key: 'currentAuth',
  default: INITIAL_CURRENT_AUTH
})

export const currentBlogState = atom({
  key: 'currentBlog',
  default: INITIAL_CURRENT_BLOG
})

export const currentBlogCategoriesState = atom({
  key: 'currentBlogCategories',
  default: INITIAL_CATEGORIES
})
