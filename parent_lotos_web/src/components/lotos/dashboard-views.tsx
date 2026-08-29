import { observer } from 'mobx-react-lite'
import {
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  Droplets,
  MapPin,
  MessageCircle,
  Trophy,
  Upload,
  UserRound,
} from 'lucide-react'
import { achievements, week } from '@/lib/lotos-data'
import { useStore } from '@/stores/store-context'

const card = 'rounded-[26px] bg-white p-6 shadow-sm'

export const HomeView = observer(function HomeView() {
  const { app } = useStore()

  return (
    <div className="space-y-5">
      <div className="grid gap-5 xl:grid-cols-[1.35fr_1fr]">
        <button
          onClick={() => app.openPanel('session')}
          className="rounded-[26px] bg-[#122e4d] p-6 text-left text-white shadow-xl sm:p-7"
        >
          <p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#9cb2c8]">Ближайшая тренировка</p>
          <h2 className="mt-2 text-3xl font-black tracking-[-.06em]">Синхронное плавание</h2>
          <div className="mt-8 flex items-end justify-between text-sm">
            <div>
              <div className="flex items-center gap-2 font-semibold">
                <CalendarDays size={16} />
                Сегодня, 26 августа
              </div>
              <div className="mt-2 flex items-center gap-2 text-[#9cb2c8]">
                <Clock3 size={16} />
                18:30 — 20:00 · Бассейн 1
              </div>
            </div>
            <ChevronRight />
          </div>
        </button>
        <div className={card}>
          <p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#9aa8b8]">Посещаемость</p>
          <h2 className="mt-2 text-4xl font-black">92%</h2>
          <div className="mt-7 h-2 overflow-hidden rounded-full bg-[#edf1f4]">
            <div className="h-full w-[92%] rounded-full bg-[#43a68f]" />
          </div>
          <p className="mt-3 text-xs font-semibold text-[#43a68f]">22 тренировки · +8% к прошлому месяцу</p>
        </div>
      </div>
      <div className={card}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#9aa8b8]">Расписание</p>
            <h2 className="mt-1 text-xl font-black">Эта неделя</h2>
          </div>
          <button onClick={() => app.navigate('Расписание')} className="text-xs font-bold text-[#be43be]">
            Весь календарь
          </button>
        </div>
        <div className="mt-5 flex gap-1">
          {week.map((d, i) => (
            <button
              key={d.date}
              onClick={() => app.navigate('Расписание')}
              className={`flex min-h-16 flex-1 flex-col items-center gap-2 rounded-2xl py-3 ${
                i === 2 ? 'bg-[#be43be] text-white' : 'text-[#9aa8b8]'
              }`}
            >
              <span className="text-[10px] font-bold">{d.day}</span>
              <b>{d.date}</b>
              <i className={`h-1.5 w-1.5 rounded-full ${i === 2 ? 'bg-white' : 'bg-[#cbd6e0]'}`} />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
})

export const ScheduleView = observer(function ScheduleView() {
  const { app } = useStore()
  const day = week[app.selectedDay]
  const sessions = [
    {
      title: 'Синхронное плавание',
      time: '18:30 — 20:00',
      pool: 'Бассейн 1',
      coach: 'Елена Викторовна',
      type: 'Групповая тренировка',
      status: 'Запланировано',
    },
    {
      title: 'ОФП',
      time: '20:15 — 21:00',
      pool: 'Зал 2',
      coach: 'Мария Андреевна',
      type: 'Физическая подготовка',
      status: 'Запланировано',
    },
  ]
  const hasSessions = day.sessions.length > 0

  return (
    <div className="space-y-5">
      <div className={card}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#9aa8b8]">Календарь занятий</p>
            <h2 className="mt-1 text-3xl font-black tracking-[-.06em]">Расписание</h2>
            <p className="mt-2 text-sm leading-6 text-[#718097]">Неделя 24–29 августа · Мария Петрова</p>
          </div>
          <button
            onClick={() => app.openPanel('message')}
            aria-label="Написать тренеру"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f9edf9] text-[#be43be]"
          >
            <MessageCircle size={19} />
          </button>
        </div>
        <div className="mt-6 -mx-6 grid grid-cols-7 gap-0 px-2 sm:mx-0 sm:gap-2 sm:px-0">
          {week.map((d, i) => (
            <button
              key={d.date}
              onClick={() => app.setSelectedDay(i)}
              aria-label={`${d.day}, ${d.date} августа`}
              className={`min-w-0 rounded-xl px-0.5 py-3 transition sm:rounded-2xl sm:px-2 ${
                i === app.selectedDay
                  ? 'bg-[#be43be] text-white shadow-lg shadow-[#be43be]/20'
                  : 'bg-[#f4f6f9] text-[#718097]'
              }`}
            >
              <span className="block truncate text-[9px] font-bold sm:text-[10px]">{d.day}</span>
              <b className="text-lg sm:text-xl">{d.date}</b>
              <span
                className={`mx-auto mt-2 block h-1.5 w-1.5 rounded-full ${
                  d.sessions.length ? 'bg-[#43a68f]' : 'bg-[#cbd6e0]'
                } ${i === app.selectedDay ? 'bg-white' : ''}`}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between px-1">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#9aa8b8]">
            {day.day}, {day.date} августа
          </p>
          <h3 className="mt-1 text-xl font-black">{hasSessions ? '2 занятия' : 'Свободный день'}</h3>
        </div>
        <span className="rounded-full bg-[#e8f5f2] px-3 py-1.5 text-[10px] font-bold text-[#338c76]">
          {hasSessions ? '2 ч 15 мин' : 'Отдых'}
        </span>
      </div>

      {hasSessions ? (
        <div className="space-y-3">
          {sessions.map((s, i) => (
            <button
              key={s.title}
              onClick={() => app.openPanel('session')}
              className="w-full rounded-[24px] bg-white p-5 text-left shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
                      i === 0 ? 'bg-[#e8f5f2] text-[#43a68f]' : 'bg-[#f9edf9] text-[#be43be]'
                    }`}
                  >
                    {i === 0 ? <Droplets size={20} /> : <UserRound size={20} />}
                  </span>
                  <span>
                    <b className="block text-sm">{i === 0 ? day.sessions[0] : s.title}</b>
                    <small className="mt-1 block text-xs text-[#8c9bad]">{s.type}</small>
                  </span>
                </div>
                <ChevronRight className="mt-2 text-[#be43be]" size={19} />
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3 border-t border-[#edf1f4] pt-4 text-xs">
                <span className="flex items-center gap-2 text-[#718097]">
                  <Clock3 size={15} className="text-[#be43be]" />
                  {s.time}
                </span>
                <span className="flex items-center gap-2 text-[#718097]">
                  <MapPin size={15} className="text-[#be43be]" />
                  {s.pool}
                </span>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[#718097]">Тренер: {s.coach}</span>
                <span className="rounded-full bg-[#e8f5f2] px-2.5 py-1 text-[10px] font-bold text-[#338c76]">
                  {s.status}
                </span>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className={card}>
          <CalendarDays className="mx-auto mb-3 text-[#be43be]" />
          <p className="text-center text-sm font-bold">В этот день занятий нет</p>
          <p className="mt-2 text-center text-xs leading-5 text-[#8c9bad]">
            Можно отдохнуть и набраться сил перед следующей тренировкой.
          </p>
        </div>
      )}

      <div className="rounded-[24px] bg-[#122e4d] p-5 text-white">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
            <CalendarDays size={18} />
          </span>
          <div>
            <b className="block text-sm">Полезно знать</b>
            <p className="mt-1 text-xs leading-5 text-[#b5c8dc]">
              Не забудьте взять купальник, полотенце и бутылку воды.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
})

export const AchievementsView = observer(function AchievementsView() {
  const { app } = useStore()

  return (
    <div className={card}>
      <p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#9aa8b8]">Путь Марии</p>
      <h2 className="mt-1 text-3xl font-black">Достижения</h2>
      <div className="mt-6 space-y-3">
        {achievements.map((a) => (
          <button
            key={a[0]}
            onClick={() => app.openPanel('achievement')}
            className="flex min-h-24 w-full items-center gap-4 rounded-2xl bg-[#fff8e9] p-4 text-left"
          >
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#f4d88d] text-[#8c661b]">
              <Trophy />
            </span>
            <span>
              <b className="block text-sm">{a[0]}</b>
              <small className="mt-1 block text-xs text-[#9d8960]">{a[1]}</small>
              <small className="mt-2 block text-[10px] font-bold uppercase text-[#b69a61]">{a[2]}</small>
            </span>
            <ChevronRight className="ml-auto text-[#be43be]" size={18} />
          </button>
        ))}
      </div>
    </div>
  )
})

export const AbsenceView = observer(function AbsenceView() {
  const { app } = useStore()

  return (
    <div className={card}>
      <p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#9aa8b8]">Здоровье и посещаемость</p>
      <h2 className="mt-1 text-3xl font-black">Пропуски</h2>
      <p className="mt-2 text-sm leading-6 text-[#718097]">
        Загрузите фото справки, и администратор проверит её.
      </p>
      <label className="mt-6 flex min-h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-[#d5dde6] bg-[#f8fafc] text-center text-xs font-bold text-[#be43be]">
        <Upload size={22} />
        {app.file || 'Загрузить фото справки'}
        <input
          className="sr-only"
          type="file"
          accept="image/*,.pdf"
          onChange={(e) => app.setFile(e.target.files?.[0]?.name || '')}
        />
      </label>
      {app.file && (
        <p className="mt-3 flex items-center gap-2 rounded-2xl bg-[#e8f5f2] p-4 text-xs font-bold text-[#338c76]">
          <Check size={17} />
          Файл отправлен на проверку
        </p>
      )}
    </div>
  )
})
