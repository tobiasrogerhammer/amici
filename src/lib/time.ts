import type { AmiciEvent } from '../types'

const startOfToday = () => {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

export function eventDate(e: AmiciEvent) {
  const d = startOfToday()
  d.setDate(d.getDate() + e.dayOffset)
  const [h, m] = e.time.split(':').map(Number)
  d.setHours(h, m)
  return d
}

const weekday = new Intl.DateTimeFormat('nb-NO', { weekday: 'long' })
const dayMonth = new Intl.DateTimeFormat('nb-NO', { day: 'numeric', month: 'short' })
const clock = new Intl.DateTimeFormat('nb-NO', { hour: '2-digit', minute: '2-digit' })

export function eventWhen(e: AmiciEvent) {
  const d = eventDate(e)
  const day = e.dayOffset === 0 ? 'I dag' : e.dayOffset === 1 ? 'I morgen' : capitalize(weekday.format(d))
  return `${day} ${dayMonth.format(d)} · ${e.time}`
}

export function dateBlock(e: AmiciEvent) {
  const d = eventDate(e)
  return { day: String(d.getDate()), month: dayMonth.format(d).replace(/[\d.\s]/g, '').slice(0, 3) }
}

export function chatTime(at: number) {
  const diff = Date.now() - at
  if (diff < 60_000) return 'nå'
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} min`
  if (diff < 86_400_000) return clock.format(at)
  if (diff < 7 * 86_400_000) return capitalize(weekday.format(at)).slice(0, 3)
  return dayMonth.format(at)
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
