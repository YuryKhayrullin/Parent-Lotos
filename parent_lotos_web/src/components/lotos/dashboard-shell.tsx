import { observer } from 'mobx-react-lite'
import { Bell, CalendarDays, FileCheck2, Home, ShieldCheck, Trophy, Waves } from 'lucide-react'
import { navItems } from '@/lib/lotos-data'
import { useStore } from '@/stores/store-context'

const icons = { home: Home, calendar: CalendarDays, trophy: Trophy, file: FileCheck2 }

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-[#be43be] text-white">
        <Waves size={23} />
      </span>
      {!compact && (
        <div>
          <p className="font-mono text-[10px] font-bold uppercase tracking-[.2em] text-[#c6d1df]">Sport Club</p>
          <p className="text-xl font-black">Лотос</p>
        </div>
      )}
      {compact && <b>Лотос</b>}
    </div>
  )
}

export const DashboardShell = observer(function DashboardShell({ children }: { children: React.ReactNode }) {
  const { app } = useStore()

  return (
    <main className="min-h-screen bg-[#f4f6f9] text-[#19283c]">
      <div className="mx-auto flex min-h-screen max-w-[1440px]">
        <aside className="hidden w-[246px] shrink-0 flex-col bg-[#102b49] px-5 py-7 text-white lg:flex">
          <Brand />
          <p className="mb-7 mt-7 px-3 text-[10px] font-bold uppercase tracking-[.2em] text-[#87a1bd]">
            Кабинет родителя
          </p>
          <nav className="space-y-2">
            {navItems.map(({ label, icon }) => {
              const Icon = icons[icon as keyof typeof icons]
              return (
                <button
                  key={label}
                  onClick={() => app.navigate(label)}
                  className={`flex min-h-11 w-full items-center gap-3 rounded-2xl px-3 py-3.5 text-left text-sm font-semibold ${
                    app.active === label ? 'bg-white text-[#173453]' : 'text-[#b8c7d8] hover:bg-white/10'
                  }`}
                >
                  <Icon size={19} />
                  {label}
                </button>
              )
            })}
          </nav>
          <div className="mt-auto rounded-2xl bg-[#1c4164] p-4">
            <div className="flex items-center gap-2 text-xs font-bold">
              <ShieldCheck size={16} />
              Данные под защитой
            </div>
            <p className="mt-2 text-[11px] leading-5 text-[#a8bfd4]">
              Информация о ребёнке доступна только вам.
            </p>
          </div>
        </aside>

        <section className="min-w-0 flex-1 px-4 pb-28 sm:px-8 lg:px-12 lg:pb-10">
          <header className="flex items-center justify-between py-5 sm:py-7">
            <div className="flex items-center gap-3 lg:hidden">
              <Brand compact />
              <span className="h-6 w-px bg-[#dfe6ed]" />
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-medium text-[#718097]">Среда, 26 августа 2026</p>
              <h1 className="mt-1 text-2xl font-black tracking-[-.04em]">Добрый день, Анна</h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                aria-label="Уведомления"
                onClick={() => app.openPanel('notifications')}
                className="relative min-h-11 rounded-full bg-white p-3 text-[#57708d] shadow-sm"
              >
                <Bell size={19} />
                <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#be43be]" />
              </button>
              <button
                aria-label="Профиль Анны"
                onClick={() => app.openPanel('profile')}
                className="flex min-h-11 items-center gap-2 rounded-full bg-white p-1.5 pr-3 shadow-sm"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#d9e5f0] text-xs font-black">
                  А
                </span>
                <span className="hidden text-xs font-bold sm:block">Анна</span>
              </button>
            </div>
          </header>
          <div className="sm:hidden">
            <p className="text-xs font-medium text-[#718097]">Среда, 26 августа 2026</p>
            <h1 className="mt-1 text-2xl font-black tracking-[-.04em]">Добрый день, Анна</h1>
          </div>
          {children}
        </section>
      </div>

      <nav className="fixed inset-x-3 bottom-3 z-20 flex justify-around rounded-[24px] bg-[#102b49] p-2 shadow-2xl lg:hidden">
        {navItems.map(({ label, icon }) => {
          const Icon = icons[icon as keyof typeof icons]
          return (
            <button
              key={label}
              onClick={() => app.navigate(label)}
              className={`flex min-w-16 flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[10px] font-bold ${
                app.active === label ? 'bg-white text-[#173453]' : 'text-[#b8c7d8]'
              }`}
            >
              <Icon size={18} />
              {label}
            </button>
          )
        })}
      </nav>
    </main>
  )
})
