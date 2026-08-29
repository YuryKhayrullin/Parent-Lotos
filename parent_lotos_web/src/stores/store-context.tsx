import { createContext, useContext } from 'react'
import type { RootStoreType } from './root-store'

export const StoreContext = createContext<RootStoreType | null>(null)

export function useStore(): RootStoreType {
  const store = useContext(StoreContext)
  if (!store) throw new Error('useStore must be used within StoreProvider')
  return store
}
