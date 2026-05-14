import { atom } from 'jotai'

export const INITIAL_CURRENT_AUTH = null
export const INITIAL_CURRENT_BLOG = null
export const INITIAL_CATEGORIES = []

export const currentAuthState = atom(
  
   INITIAL_CURRENT_AUTH
)

export const currentBlogState = atom(
  
   INITIAL_CURRENT_BLOG
)

export const currentBlogCategoriesState = atom(
  
   INITIAL_CATEGORIES
)
