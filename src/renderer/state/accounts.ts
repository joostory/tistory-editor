import { atom } from 'jotai'
import { Account } from '../types'

export const INITIAL_ACCOUNTS: Account[] = []

export const accountsState = atom<Account[]>(INITIAL_ACCOUNTS)
