import { CalendarDays, Compass, MessageCircle } from 'lucide-react'
import { useStore } from '../state/store'
import type { Tab } from '../types'
import { Avatar } from './Avatar'

const tabs: { id: Tab; label: string }[] = [
  { id: 'discover', label: 'Oppdag' },
  { id: 'events', label: 'Arrangementer' },
  { id: 'chats', label: 'Chats' },
  { id: 'profile', label: 'Profil' },
]

export function TabBar({ active, onSelect }: { active: Tab; onSelect: (t: Tab) => void }) {
  const { state } = useStore()
  const unread = state.chats.reduce((n, c) => n + (c.unread > 0 ? 1 : 0), 0)

  return (
    <nav className="tabbar" aria-label="Hovedmeny">
      {tabs.map((t) => {
        const isActive = t.id === active
        const stroke = isActive ? 2.6 : 1.9
        return (
          <button
            key={t.id}
            type="button"
            className={`tabbar__btn${isActive ? ' is-active' : ''}`}
            aria-label={t.id === 'chats' && unread ? `${t.label}, ${unread} uleste` : t.label}
            aria-current={isActive ? 'page' : undefined}
            onClick={() => onSelect(t.id)}
          >
            {t.id === 'discover' && <Compass size={23} strokeWidth={stroke} aria-hidden />}
            {t.id === 'events' && <CalendarDays size={22} strokeWidth={stroke} aria-hidden />}
            {t.id === 'chats' && (
              <span className="tabbar__icon">
                <MessageCircle size={22} strokeWidth={stroke} aria-hidden />
                {unread > 0 && <span className="badge">{unread}</span>}
              </span>
            )}
            {t.id === 'profile' && <Avatar id="me" size={26} ring={isActive} />}
            <span className="tabbar__dot" aria-hidden />
          </button>
        )
      })}
    </nav>
  )
}
