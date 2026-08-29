import { types, type Instance } from 'mobx-state-tree'
import type { NavItem, Panel } from '@/lib/lotos-data'

export const AppStore = types
  .model('AppStore', {
    active: types.optional(
      types.enumeration(['Главная', 'Расписание', 'Достижения', 'Пропуски']),
      'Главная',
    ),
    selectedDay: types.optional(types.number, 2),
    panel: types.maybeNull(types.string),
    file: types.optional(types.string, ''),
    notice: types.optional(types.string, ''),
  })
  .actions((self) => ({
    navigate(item: NavItem) {
      self.active = item
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    setSelectedDay(index: number) {
      self.selectedDay = index
    },
    openPanel(panel: Panel) {
      self.panel = panel
    },
    closePanel() {
      self.panel = null
    },
    setFile(name: string) {
      self.file = name
    },
    notify(message: string) {
      self.notice = message
    },
    clearNotice() {
      self.notice = ''
    },
  }))

export type AppStoreType = Instance<typeof AppStore>
