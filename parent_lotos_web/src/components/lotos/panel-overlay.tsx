import { observer } from 'mobx-react-lite'
import { Check, MessageCircle, X } from 'lucide-react'
import { useStore } from '@/stores/store-context'

const titles: Record<string, string> = {
  notifications: 'Уведомления',
  profile: 'Профиль родителя',
  children: 'Дети',
  session: 'Тренировка',
  achievement: 'Достижение',
  message: 'Сообщение тренеру',
}

export const PanelOverlay = observer(function PanelOverlay() {
  const { app, auth } = useStore()
  const name = app.panel!

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-[#102b49]/40 p-3 sm:items-center"
      onClick={() => app.closePanel()}
    >
      <section
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-[28px] bg-white p-6 text-[#19283c] shadow-2xl"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-black">{titles[name] || 'Раздел'}</h2>
          <button aria-label="Закрыть" onClick={() => app.closePanel()} className="rounded-full bg-[#f4f6f9] p-2">
            <X size={18} />
          </button>
        </div>

        {name === 'notifications' && (
          <div className="space-y-3">
            {['Тренировка сегодня в 18:30', 'Абонемент продлён до 30 сентября', 'Добавлено новое достижение'].map(
              (item) => (
                <div key={item} className="rounded-2xl bg-[#f4f6f9] p-4 text-sm font-bold">
                  {item}
                  <p className="mt-1 text-xs font-medium text-[#8c9bad]">Сегодня</p>
                </div>
              ),
            )}
          </div>
        )}

        {name === 'profile' && (
          <div className="space-y-3">
            <div className="rounded-2xl bg-[#f4f6f9] p-4">
              <b>Анна Петрова</b>
              <p className="mt-1 text-xs text-[#718097]">{auth.phone || '+7 999 123-45-67'}</p>
            </div>
            <button
              onClick={() => {
                auth.logout()
                app.closePanel()
              }}
              className="min-h-12 w-full rounded-2xl bg-[#122e4d] text-sm font-bold text-white"
            >
              Выйти
            </button>
          </div>
        )}

        {name === 'children' && (
          <button
            onClick={() => app.closePanel()}
            className="flex min-h-14 w-full items-center justify-between rounded-2xl bg-[#f4f6f9] p-4 text-left text-sm font-bold"
          >
            Мария Соколова · 8 лет
            <Check className="text-[#be43be]" />
          </button>
        )}

        {name === 'session' && (
          <div className="space-y-3 text-sm">
            <div className="rounded-2xl bg-[#e9f0f7] p-4">
              <b>Синхронное плавание</b>
              <p className="mt-2 text-xs text-[#718097]">Сегодня, 18:30—20:00 · Бассейн 1</p>
            </div>
            <button
              onClick={() => {
                app.notify('Тренировка добавлена в календарь')
                app.closePanel()
              }}
              className="min-h-12 w-full rounded-2xl bg-[#be43be] font-bold text-white"
            >
              Добавить в календарь
            </button>
          </div>
        )}

        {name === 'achievement' && (
          <div className="rounded-2xl bg-[#fff8e9] p-5 text-sm">
            <b>Первые соревнования</b>
            <p className="mt-2 text-[#9d8960]">Открытый кубок клуба «Лотос»</p>
          </div>
        )}

        {name === 'message' && (
          <button
            onClick={() => {
              app.notify('Сообщение отправлено тренеру')
              app.closePanel()
            }}
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#be43be] text-sm font-bold text-white"
          >
            <MessageCircle size={17} />
            Отправить сообщение
          </button>
        )}
      </section>
    </div>
  )
})
