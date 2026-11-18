import { Check, Clock, Leaf, MapPin, Users } from 'lucide-react'
import { interestLabel } from '../lib/data'
import { dateBlock, eventWhen } from '../lib/time'
import { useStore } from '../state/store'
import type { AmiciEvent } from '../types'
import { Avatar } from './Avatar'

export const priceLabel = (p: number) => (p === 0 ? 'Gratis' : `${p} kr`)

export function EventCard({
  event,
  onOpen,
  compact = false,
  highlight = [],
}: {
  event: AmiciEvent
  onOpen: (e: AmiciEvent) => void
  compact?: boolean
  highlight?: string[]
}) {
  const { state } = useStore()
  const joined = state.joined.includes(event.id)
  const spots = state.spots[event.id]
  const d = dateBlock(event)

  return (
    <button type="button" className={`event-card${compact ? ' event-card--compact' : ''}`} onClick={() => onOpen(event)}>
      <span className="event-card__date" aria-hidden>
        <span className="event-card__day">{d.day}</span>
        <span className="event-card__month">{d.month}</span>
      </span>
      <span className="event-card__body">
        <span className="event-card__org">
          {event.kind === 'group' ? <Users size={14} aria-hidden /> : null}
          {event.organizer}
        </span>
        <span className="event-card__title">{event.title}</span>
        <span className="event-card__meta">
          <Clock size={14} aria-hidden /> {eventWhen(event)}
        </span>
        <span className="event-card__meta">
          <MapPin size={14} aria-hidden /> {event.place}
        </span>
        {!compact && (
          <span className="event-card__tags">
            <span className="tag tag--price">{priceLabel(event.price)}</span>
            {event.alcoholFree && (
              <span className="tag tag--soft">
                <Leaf size={13} aria-hidden /> Rusfritt
              </span>
            )}
            {event.interests.slice(0, 2).map((i) => (
              <span key={i} className={`tag${highlight.includes(i) ? ' tag--match' : ''}`}>
                {highlight.includes(i) && <Check size={12} aria-hidden />}
                {interestLabel(i)}
              </span>
            ))}
          </span>
        )}
        {event.kind === 'group' && spots != null && (
          <span className="event-card__spots">
            <span className="avatars-row" aria-hidden>
              {event.hostMemberIds?.slice(0, 3).map((id) => <Avatar key={id} id={id} size={22} />)}
            </span>
            {joined ? 'Du er med' : spots > 0 ? `${spots} ledige plasser` : 'Fullt'}
          </span>
        )}
      </span>
      {joined && (
        <span className="event-card__joined" aria-label="Du er påmeldt">
          <Check size={16} strokeWidth={3} aria-hidden />
        </span>
      )}
    </button>
  )
}
