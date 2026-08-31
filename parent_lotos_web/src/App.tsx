import { useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import { AuthScreen } from '@/components/lotos/auth-screen'
import { SetPinModal } from '@/components/lotos/set-pin-modal'
import { LockScreen } from '@/components/lotos/lock-screen'
import { DashboardShell } from '@/components/lotos/dashboard-shell'
import { HomeView, ScheduleView, AchievementsView, AbsenceView } from '@/components/lotos/dashboard-views'
import { PanelOverlay } from '@/components/lotos/panel-overlay'
import { NoticeToast } from '@/components/lotos/notice-toast'
import { useStore } from '@/stores/store-context'

export const App = observer(function App() {
  const { auth, app } = useStore()

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const token = urlParams.get('token')
    if (token) {
      auth.magicLogin(token)
      window.history.replaceState({}, '', window.location.pathname)
    } else {
      auth.checkSession()
    }
  }, [auth])

  if (auth.loading) {
    return <main className="flex min-h-screen items-center justify-center">Loading...</main>
  }

  if (!auth.authenticated) {
    return <AuthScreen />
  }

  if (!auth.user?.has_pin) {
    return <SetPinModal />
  }
  
  if (!auth.isUnlocked) {
    return <LockScreen />
  }

  return (
    <DashboardShell>
      {app.active === 'Главная' && <HomeView />}
      {app.active === 'Расписание' && <ScheduleView />}
      {app.active === 'Достижения' && <AchievementsView />}
      {app.active === 'Пропуски' && <AbsenceView />}
      {app.panel && <PanelOverlay />}
      {app.notice && <NoticeToast />}
    </DashboardShell>
  )
})
