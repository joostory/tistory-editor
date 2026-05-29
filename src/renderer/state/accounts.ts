import { atom } from 'jotai'
import { Account } from '#/renderer/types'

export const INITIAL_ACCOUNTS: Account[] = []

export const accountsState = atom<Account[]>(INITIAL_ACCOUNTS)
