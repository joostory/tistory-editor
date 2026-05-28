import { atom } from 'jotai'
import { Preferences } from '../types'

export const INITIAL_PREFERENCES: Preferences = {}

export const preferencesState = atom<Preferences>(INITIAL_PREFERENCES)
