import { types, flow, type Instance } from 'mobx-state-tree'

export const AuthStore = types
  .model('AuthStore', {
    authenticated: types.optional(types.boolean, false),
    isUnlocked: types.optional(types.boolean, false),
    step: types.optional(types.enumeration(['phone', 'code', 'pin']), 'phone'),
    phone: types.optional(types.string, ''),
    code: types.optional(types.string, ''),
    pin: types.optional(types.string, ''),
    loading: types.optional(types.boolean, false),
    error: types.optional(types.string, ''),
    user: types.maybe(types.frozen<{ id: string, has_pin: boolean }>()),
    devCode: types.maybe(types.string),
    token: types.maybe(types.string),
  })
  .actions((self) => ({
    getHeaders(withAuth: boolean = true) {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
      if (withAuth && self.token) {
        headers['Authorization'] = `Bearer ${self.token}`
      }
      return headers
    },
    setPhone(value: string) {
      self.phone = value
      self.error = ''
    },
    setCode(value: string) {
      self.code = value.replace(/\D/g, '').slice(0, 6)
      self.error = ''
    },
    setPin(value: string) {
      self.pin = value.replace(/\D/g, '').slice(0, 4)
      self.error = ''
    },
    backToPhone() {
      self.step = 'phone'
      self.code = ''
      self.pin = ''
      self.devCode = undefined
      self.error = ''
    },
    setAuthStep(step: 'phone' | 'code' | 'pin') {
      self.step = step
    },
    unlockApp: flow(function* (pin: string) {
      self.loading = true
      self.error = ''
      try {
        const response = yield fetch('/api/auth/unlock', {
          method: 'POST',
          headers: self.getHeaders(true),
          body: JSON.stringify({ pin }),
        })
        if (response.ok) {
          self.isUnlocked = true
          sessionStorage.setItem('isUnlocked', 'true')
        } else {
          const data = yield response.json()
          self.error = data.message || 'Неверный PIN-код'
        }
      } catch (e) {
        console.error('unlockApp error:', e)
        self.error = 'Ошибка сети'
      } finally {
        self.loading = false
      }
    }),
    magicLogin: flow(function* (token: string) {
      self.loading = true
      try {
        const response = yield fetch('/api/auth/magic-login', {
          method: 'POST',
          headers: self.getHeaders(false),
          body: JSON.stringify({ token }),
        })
        const data = yield response.json()
        if (response.ok) {
          self.authenticated = true
          self.user = data.user
          self.token = data.token
          localStorage.setItem('token', data.token)
        } else {
          self.error = 'Не удалось авторизоваться по ссылке'
        }
      } catch {
        self.error = 'Ошибка сети'
      } finally {
        self.loading = false
      }
    }),
    pinLogin: flow(function* () {
      self.loading = true
      self.error = ''
      try {
        const response = yield fetch('/api/auth/pin-login', {
          method: 'POST',
          headers: self.getHeaders(false),
          body: JSON.stringify({ phone: self.phone, pin: self.pin }),
        })
        const data = yield response.json()
        if (!response.ok) {
          self.error = 'Неверный телефон или PIN'
          return
        }
        self.authenticated = true
        self.user = data.user
        self.token = data.token
        localStorage.setItem('token', data.token)
        
        self.isUnlocked = true
        sessionStorage.setItem('isUnlocked', 'true')
      } catch {
        self.error = 'Ошибка сети. Попробуйте позже.'
      } finally {
        self.loading = false
      }
    }),
    savePin: flow(function* (pin: string) {
      self.loading = true
      self.error = ''
      try {
        const response = yield fetch('/api/auth/set-pin', {
          method: 'POST',
          headers: self.getHeaders(true),
          body: JSON.stringify({ pin }),
        })
        const data = yield response.json()
        if (response.ok) {
          self.user = data.user
          self.isUnlocked = true
          sessionStorage.setItem('isUnlocked', 'true')
        } else {
          self.error = data.message ?? 'Не удалось установить PIN'
        }
      } catch (e) {
        console.error('savePin error:', e)
        self.error = 'Ошибка сети'
      } finally {
        self.loading = false
      }
    }),
    requestOtp: flow(function* () {
      self.loading = true
      self.error = ''
      try {
        const response = yield fetch('/api/auth/request-otp', {
          method: 'POST',
          headers: self.getHeaders(false),
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
          headers: self.getHeaders(false),
          body: JSON.stringify({ phone: self.phone, otp: self.code.replace(/\D/g, '') }),
        })
        const data = yield response.json()
        if (!response.ok) {
          self.error = data.error ?? 'Неверный код'
          return
        }
        self.authenticated = true
        self.user = data.user
        self.token = data.token
        localStorage.setItem('token', data.token)
      } catch {
        self.error = 'Ошибка сети. Попробуйте позже.'
      } finally {
        self.loading = false
      }
    }),
    logout: flow(function* () {
      try {
        yield fetch('/api/auth/logout', { method: 'POST', headers: self.getHeaders(true) })
      } catch {
        // ignore network errors on logout
      }
      self.authenticated = false
      self.isUnlocked = false
      self.step = 'phone'
      self.phone = ''
      self.code = ''
      self.pin = ''
      self.token = undefined
      self.user = undefined
      self.devCode = undefined
      self.error = ''
      localStorage.removeItem('token')
      sessionStorage.removeItem('isUnlocked')
    }),
    checkSession: flow(function* () {
      self.token = localStorage.getItem('token') || undefined
      // Do NOT persist isUnlocked across reloads in localStorage. 
      // Force user to unlock on page refresh.
      self.isUnlocked = false
      sessionStorage.removeItem('isUnlocked')
      
      if (!self.token) return

      try {
        const response = yield fetch('/api/me', { headers: self.getHeaders(true) })
        if (response.ok) {
          const data = yield response.json()
          self.authenticated = true
          self.user = data
          if (data.phone) self.phone = data.phone
        } else if (response.status === 401) {
          self.logout()
        }
      } catch {
        // no session
      }
    }),
  }))

export type AuthStoreType = Instance<typeof AuthStore>
