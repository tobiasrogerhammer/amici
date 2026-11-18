import { Check } from 'lucide-react'
import { useMemo, useState } from 'react'
import { EventCard } from '../components/EventCard'
import { events } from '../lib/data'
import { useStore } from '../state/store'
import type { AmiciEvent } from '../types'

type Source = 'all' | 'official' | 'group'
type Chip = 'free' | 'sober' | 'week'

const sources: [Source, string][] = [
  ['all', 'Alle'],
  ['official', 'I byen'],
  ['group', 'Fra grupper'],
]

const chips: [Chip, string][] = [
  ['free', 'Gratis'],
  ['sober', 'Rusfritt'],
  ['week', 'Denne uka'],
]

/** Overskrift og forklaring for hver fane */
const intro: Record<Source, { title: string; sub: string }> = {
  all: {
    title: 'Alt som skjer',
    sub: 'Grupper på Amici som har plass til flere, og arrangementer i byen de neste ukene.',
  },
  group: {
    title: 'Grupper med ledige plasser',
    sub: 'Bli med en liten gruppe som allerede har en plan. Du trenger ikke kjenne noen.',
  },
  official: {
    title: 'Skjer i byen',
    sub: 'Arrangementer fra studentforeninger, idrettslag, bibliotek og andre i Trondheim.',
  },
}

export function Events({ onOpenEvent }: { onOpenEvent: (e: AmiciEvent) => void }) {
  const { state } = useStore()
  const [source, setSource] = useState<Source>('all')
  const [active, setActive] = useState<Chip[]>([])

  const list = useMemo(
    () =>
      events
        .filter((e) => source === 'all' || e.kind === source)
        .filter((e) => !active.includes('free') || e.price === 0)
        .filter((e) => !active.includes('sober') || e.alcoholFree)
        .filter((e) => !active.includes('week') || e.dayOffset <= 7)
        .sort((a, b) => a.dayOffset - b.dayOffset || a.time.localeCompare(b.time)),
    [source, active],
  )

  const groupOpen = list.filter((e) => e.kind === 'group')
  const official = list.filter((e) => e.kind === 'official')
  const toggle = (c: Chip) => setActive((a) => (a.includes(c) ? a.filter((x) => x !== c) : [...a, c]))

  const cards = (items: AmiciEvent[]) => (
    <div className="event-list">
      {items.map((e) => (
        <EventCard key={e.id} event={e} onOpen={onOpenEvent} highlight={state.me.interests} />
      ))}
    </div>
  )

  return (
    <section className="screen" aria-label="Arrangementer">
      <header className="hero">
        <h1>Arrangementer</h1>
        <p>Det som skjer i Trondheim, og grupper som har plass til flere.</p>
        <div className="segmented segmented--on-red" role="tablist" aria-label="Kilde">
          {sources.map(([id, label]) => (
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

      <div className="event-sections">
        <section>
          <h2 className="section-title">{intro[source].title}</h2>
          <p className="section-sub">{intro[source].sub}</p>
          <div className="chips event-filters" role="group" aria-label="Filtre">
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

          {source === 'all' ? (
            <div className="event-subsections">
              {groupOpen.length > 0 && (
                <section>
                  <h3 className="subsection-title">Grupper med ledige plasser</h3>
                  {cards(groupOpen)}
                </section>
              )}
              {official.length > 0 && (
                <section>
                  <h3 className="subsection-title">Skjer i byen</h3>
                  {cards(official)}
                </section>
              )}
            </div>
          ) : (
            cards(list)
          )}

          {list.length === 0 && <p className="muted center pad">Ingen arrangementer passer filtrene akkurat nå.</p>}
        </section>
      </div>
    </section>
  )
}
