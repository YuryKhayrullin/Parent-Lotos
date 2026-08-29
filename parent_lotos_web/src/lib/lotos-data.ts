export type NavItem = 'Главная' | 'Расписание' | 'Достижения' | 'Пропуски'

export const navItems: { label: NavItem; icon: string }[] = [
  { label: 'Главная', icon: 'home' },
  { label: 'Расписание', icon: 'calendar' },
  { label: 'Достижения', icon: 'trophy' },
  { label: 'Пропуски', icon: 'file' },
]

export const week = [
  { day: 'Пн', date: '24', sessions: [] as string[] },
  { day: 'Вт', date: '25', sessions: ['Техника'] },
  { day: 'Ср', date: '26', sessions: ['Синхронное плавание'] },
  { day: 'Чт', date: '27', sessions: ['ОФП'] },
  { day: 'Пт', date: '28', sessions: ['Синхронное плавание'] },
  { day: 'Сб', date: '29', sessions: [] as string[] },
]

export const achievements = [
  ['Первые соревнования', 'Открытый кубок клуба «Лотос»', '15 августа 2026'],
  ['Первые 10 тренировок', 'Стабильность и уверенность', '28 июля 2026'],
  ['Шпагат на воде', 'Новый элемент в программе', '12 июня 2026'],
] as const

export type Panel = 'notifications' | 'profile' | 'children' | 'message' | 'session' | 'achievement' | null

export function formatPhone(value: string) {
  const digits = value.replace(/\D/g, '')
  if (digits.length <= 1) return '+7'
  const rest = digits.startsWith('7') ? digits.slice(1) : digits.startsWith('8') ? digits.slice(1) : digits
  let result = '+7'
  if (rest.length > 0) result += ` (${rest.slice(0, 3)}`
  if (rest.length >= 3) result += `) ${rest.slice(3, 6)}`
  if (rest.length >= 6) result += `-${rest.slice(6, 8)}`
  if (rest.length >= 8) result += `-${rest.slice(8, 10)}`
  return result
}
