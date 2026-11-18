import { Check } from 'lucide-react'
import { useMemo, useState } from 'react'
import { EventCard } from '../components/EventCard'
import { events } from '../lib/data'
import { eventScore } from '../lib/match'
import { useStore } from '../state/store'
import type { AmiciEvent } from '../types'

type Source = 'all' | 'official' | 'group'
type Chip = 'forYou' | 'free' | 'sober' | 'week'

const chips: [Chip, string][] = [
  ['forYou', 'For deg'],
  ['free', 'Gratis'],
  ['sober', 'Rusfritt'],
  ['week', 'Denne uka'],
]

export function Events({ onOpenEvent }: { onOpenEvent: (e: AmiciEvent) => void }) {
  const { state } = useStore()
  const [source, setSource] = useState<Source>('all')
  const [active, setActive] = useState<Chip[]>([])

  const list = useMemo(() => {
    const out = events
      .filter((e) => source === 'all' || e.kind === source)
      .filter((e) => !active.includes('forYou') || eventScore(state.me, e) > 0)
      .filter((e) => !active.includes('free') || e.price === 0)
      .filter((e) => !active.includes('sober') || e.alcoholFree)
      .filter((e) => !active.includes('week') || e.dayOffset <= 7)
    return active.includes('forYou')
      ? out.sort((a, b) => eventScore(state.me, b) - eventScore(state.me, a) || a.dayOffset - b.dayOffset)
      : out.sort((a, b) => a.dayOffset - b.dayOffset || a.time.localeCompare(b.time))
  }, [source, active, state.me])

  const groupOpen = list.filter((e) => e.kind === 'group')
  const official = list.filter((e) => e.kind === 'official')
  const toggle = (c: Chip) => setActive((a) => (a.includes(c) ? a.filter((x) => x !== c) : [...a, c]))

  return (
    <section className="screen" aria-label="Arrangementer">
      <header className="hero">
        <h1>Arrangementer</h1>
        <p>Det som skjer i Trondheim, og grupper som har plass til flere.</p>
        <div className="segmented segmented--on-red" role="tablist" aria-label="Kilde">
          {(
            [
              ['all', 'Alle'],
              ['official', 'I byen'],
              ['group', 'Fra grupper'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={source === id}
              className={source === id ? 'is-active' : ''}
              onClick={() => setSource(id)}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      <div className="chips" role="group" aria-label="Filtre">
        {chips.map(([id, label]) => {
          const on = active.includes(id)
          return (
            <button key={id} type="button" className={`chip${on ? ' is-on' : ''}`} aria-pressed={on} onClick={() => toggle(id)}>
              {on && <Check size={15} strokeWidth={3} aria-hidden />}
              {label}
            </button>
          )
        })}
      </div>

      <div className="event-sections">
        {groupOpen.length > 0 && (
          <section>
            <h2 className="section-title">Grupper med ledige plasser</h2>
            <p className="section-sub">Bli med en liten gruppe som allerede har en plan. Du trenger ikke kjenne noen.</p>
            <div className="event-list">
              {groupOpen.map((e) => (
                <EventCard key={e.id} event={e} onOpen={onOpenEvent} highlight={state.me.interests} />
              ))}
            </div>
          </section>
        )}
        {official.length > 0 && (
          <section>
            <h2 className="section-title">Skjer i byen</h2>
            <div className="event-list">
              {official.map((e) => (
                <EventCard key={e.id} event={e} onOpen={onOpenEvent} highlight={state.me.interests} />
              ))}
            </div>
          </section>
        )}
        {list.length === 0 && <p className="muted center pad">Ingen arrangementer passer filtrene akkurat nå.</p>}
      </div>
    </section>
  )
}
