import { types, type Instance } from 'mobx-state-tree'
import { AuthStore } from './auth-store'
import { AppStore } from './app-store'

export const RootStore = types.model('RootStore', {
  auth: AuthStore,
  app: AppStore,
})

export type RootStoreType = Instance<typeof RootStore>

export function createRootStore(): RootStoreType {
  return RootStore.create({
    auth: {},
    app: {},
  })
}
