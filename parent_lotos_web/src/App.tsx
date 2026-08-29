import { useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import { AuthScreen } from '@/components/lotos/auth-screen'
import { DashboardShell } from '@/components/lotos/dashboard-shell'
import { HomeView, ScheduleView, AchievementsView, AbsenceView } from '@/components/lotos/dashboard-views'
import { PanelOverlay } from '@/components/lotos/panel-overlay'
import { NoticeToast } from '@/components/lotos/notice-toast'
import { useStore } from '@/stores/store-context'

export const App = observer(function App() {
  const { auth, app } = useStore()

  useEffect(() => {
    auth.checkSession()
  }, [auth])

  if (!auth.authenticated) {
    return <AuthScreen />
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
