import { AnimatePresence, motion } from 'motion/react'
import { Check, Clock, Leaf, MapPin, MapPinned, Users, Wallet, X } from 'lucide-react'
import { getProfile, interestLabel } from '../lib/data'
import { eventWhen } from '../lib/time'
import { useStore } from '../state/store'
import type { AmiciEvent } from '../types'
import { Avatar } from './Avatar'
import { priceLabel } from './EventCard'

export function EventSheet({ event, onClose }: { event: AmiciEvent | null; onClose: () => void }) {
  const { state, dispatch } = useStore()

  return (
    <AnimatePresence>
      {event && (
        <motion.div
          className="sheet-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="sheet-title"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sheet__handle" aria-hidden />
            <button type="button" className="icon-btn sheet__close" aria-label="Lukk" onClick={onClose}>
              <X size={22} />
            </button>
            <p className="eyebrow">{event.kind === 'group' ? 'Arrangert av en gruppe på Amici' : event.organizer}</p>
            <h2 id="sheet-title" className="sheet__title">
              {event.title}
            </h2>

            <ul className="facts">
              <li>
                <Clock size={18} aria-hidden /> {eventWhen(event)}
              </li>
              <li>
                <MapPin size={18} aria-hidden /> {event.place}, {event.area}
              </li>
              <li>
                <Wallet size={18} aria-hidden /> {priceLabel(event.price)}
              </li>
              {event.alcoholFree && (
                <li>
                  <Leaf size={18} aria-hidden /> Rusfritt arrangement
                </li>
              )}
              {event.kind === 'group' && state.spots[event.id] != null && (
                <li>
                  <Users size={18} aria-hidden />{' '}
                  {state.spots[event.id] > 0 ? `${state.spots[event.id]} ledige plasser` : 'Ingen ledige plasser'}
                </li>
              )}
            </ul>

            <p className="sheet__desc">{event.description}</p>

            <div className="tags-wrap">
              {event.interests.map((i) => (
                <span key={i} className={`tag${state.me.interests.includes(i) ? ' tag--match' : ''}`}>
                  {state.me.interests.includes(i) && <Check size={12} aria-hidden />}
                  {interestLabel(i)}
                </span>
              ))}
            </div>

            {event.kind === 'group' && (
              <>
                <div className="hosts">
                  <p className="label">
                    <Users size={16} aria-hidden /> {event.organizer}
                  </p>
                  <div className="hosts__list">
                    {event.hostMemberIds?.map((id) => (
                      <span key={id} className="hosts__person">
                        <Avatar id={id} size={40} />
                        <span>{getProfile(id)?.name}</span>
                      </span>
                    ))}
                  </div>
                </div>
                {event.meetingPoint && (
                  <div className="meeting-box">
                    <MapPinned size={20} aria-hidden />
                    <div>
                      <p className="meeting-box__label">Møtested</p>
                      <p>{event.meetingPoint}</p>
                    </div>
                  </div>
                )}
              </>
            )}

            <JoinButton event={event} onToggle={() => dispatch({ type: 'toggleJoin', eventId: event.id })} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function JoinButton({ event, onToggle }: { event: AmiciEvent; onToggle: () => void }) {
  const { state } = useStore()
  const joined = state.joined.includes(event.id)
  const spots = state.spots[event.id]
  const full = spots != null && spots <= 0 && !joined

  if (joined)
    return (
      <button type="button" className="btn btn--secondary btn--block" onClick={onToggle}>
        <Check size={18} aria-hidden /> Du er med · Meld av
      </button>
    )
  return (
    <button type="button" className="btn btn--primary btn--block" onClick={onToggle} disabled={full}>
      {full ? 'Fullt' : event.kind === 'group' ? 'Bli med' : 'Jeg blir med'}
    </button>
  )
}
