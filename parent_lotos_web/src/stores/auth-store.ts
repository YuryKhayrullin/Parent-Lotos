import { types, flow, type Instance } from 'mobx-state-tree'

export const AuthStore = types
  .model('AuthStore', {
    authenticated: types.optional(types.boolean, false),
    step: types.optional(types.enumeration(['phone', 'code']), 'phone'),
    phone: types.optional(types.string, ''),
    code: types.optional(types.string, ''),
    loading: types.optional(types.boolean, false),
    error: types.optional(types.string, ''),
    parentId: types.maybe(types.string),
    devCode: types.maybe(types.string),
  })
  .actions((self) => ({
    setPhone(value: string) {
      self.phone = value
      self.error = ''
    },
    setCode(value: string) {
      self.code = value.replace(/\D/g, '').slice(0, 6)
      self.error = ''
    },
    backToPhone() {
      self.step = 'phone'
      self.code = ''
      self.devCode = undefined
      self.error = ''
    },
    requestOtp: flow(function* () {
      self.loading = true
      self.error = ''
      try {
        const response = yield fetch('/api/auth/request-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: self.phone }),
        })
        const data = yield response.json()
        if (!response.ok) {
          self.error = data.error ?? 'Не удалось отправить код'
          return
        }
        self.step = 'code'
        if (data.devCode) self.devCode = data.devCode
      } catch {
        self.error = 'Ошибка сети. Попробуйте позже.'
      } finally {
        self.loading = false
      }
    }),
    verifyOtp: flow(function* () {
      self.loading = true
      self.error = ''
      try {
        const response = yield fetch('/api/auth/verify-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ phone: self.phone, code: self.code }),
        })
        const data = yield response.json()
        if (!response.ok) {
          self.error = data.error ?? 'Неверный код'
          return
        }
        self.authenticated = true
        self.parentId = data.parentId
      } catch {
        self.error = 'Ошибка сети. Попробуйте позже.'
      } finally {
        self.loading = false
      }
    }),
    logout: flow(function* () {
      try {
        yield fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
      } catch {
        // ignore network errors on logout
      }
      self.authenticated = false
      self.step = 'phone'
      self.phone = ''
      self.code = ''
      self.parentId = undefined
      self.devCode = undefined
      self.error = ''
    }),
    checkSession: flow(function* () {
      try {
        const response = yield fetch('/api/me', { credentials: 'include' })
        if (response.ok) {
          const data = yield response.json()
          self.authenticated = true
          self.parentId = data.parent?.id
          if (data.parent?.phone) self.phone = data.parent.phone
        }
      } catch {
        // no session
      }
    }),
  }))

export type AuthStoreType = Instance<typeof AuthStore>
