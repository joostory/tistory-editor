import { atom } from 'jotai'
import { Post } from '../types'

export const INITIAL_CURRENT_POST: Post | null = null

export const currentPostState = atom<Post | null>(INITIAL_CURRENT_POST)
