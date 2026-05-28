import { atom } from 'jotai'
import { Auth, Blog } from '../types'

export const INITIAL_CURRENT_AUTH: Auth | null = null
export const INITIAL_CURRENT_BLOG: Blog | null = null
export const INITIAL_CATEGORIES: any[] = []

export const currentAuthState = atom<Auth | null>(INITIAL_CURRENT_AUTH)
export const currentBlogState = atom<Blog | null>(INITIAL_CURRENT_BLOG)
export const currentBlogCategoriesState = atom<any[]>(INITIAL_CATEGORIES)
