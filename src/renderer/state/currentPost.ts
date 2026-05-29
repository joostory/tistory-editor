import { atom } from 'jotai'
import { Post } from '#/renderer/types'

export const INITIAL_CURRENT_POST: Post | null = null

export const currentPostState = atom<Post | null>(INITIAL_CURRENT_POST)
