import { animate, AnimatePresence, motion, useMotionValue, useTransform } from 'motion/react'
import { Check, MapPin, RotateCcw, SlidersHorizontal, Undo2, UserPlus, X } from 'lucide-react'
import { useImperativeHandle, useMemo, useRef, type Ref } from 'react'
import { Avatar } from '../components/Avatar'
import { avatarUri } from '../lib/avatar'
import { colorFor, interestLabel, profiles } from '../lib/data'
import { candidates } from '../lib/match'
import { useStore } from '../state/store'
import type { Profile } from '../types'

type CardHandle = { swipe: (dir: 'like' | 'pass') => void }

export function Discover({ onEditProfile }: { onEditProfile: () => void }) {
  const { state, dispatch } = useStore()
  const deck = useMemo(() => candidates(state.me, profiles, state.swiped), [state.me, state.swiped])
  const handles = useRef<Record<string, CardHandle>>({})
  const swipeTop = (dir: 'like' | 'pass') => deck[0] && handles.current[deck[0].profile.id]?.swipe(dir)
  const canUndo = state.history.length > 0 && state.swiped[state.history[state.history.length - 1]] === 'pass'

  return (
    <section className="screen screen--discover" aria-label="Oppdag">
      <header className="topbar">
        <img src="/brand/amici-mark.png" alt="" className="topbar__mark" />
        <img src="/brand/amici-wordmark.png" alt="Amici" className="topbar__word" />
        <button type="button" className="icon-btn topbar__action" aria-label="Endre interesser og filtre" onClick={onEditProfile}>
          <SlidersHorizontal size={22} />
        </button>
      </header>

      <div className="deck">
        {deck.length === 0 ? (
          <div className="empty">
            <img src="/brand/amici-mark.png" alt="" className="empty__mark" />
            <h2>Du har sett alle forslagene</h2>
            <p>Legg til flere interesser eller utvid filtrene for å få nye forslag.</p>
            <button type="button" className="btn btn--primary" onClick={onEditProfile}>
              Endre interesser
            </button>
            <button type="button" className="btn btn--ghost" onClick={() => dispatch({ type: 'resetDeck' })}>
              <RotateCcw size={18} aria-hidden /> Vis de jeg hoppet over
            </button>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {deck
              .slice(0, 3)
              .reverse()
              .map((c, i, arr) => {
                const isTop = i === arr.length - 1
                return (
                  <SwipeCard
                    key={c.profile.id}
                    ref={(h: CardHandle | null) => {
                      if (h) handles.current[c.profile.id] = h
                      else delete handles.current[c.profile.id]
                    }}
                    profile={c.profile}
                    shared={c.shared}
                    depth={arr.length - 1 - i}
                    active={isTop}
                    onSwiped={(dir) => dispatch({ type: 'swipe', id: c.profile.id, dir })}
                  />
                )
              })}
          </AnimatePresence>
        )}
      </div>

      {deck.length > 0 && (
        <div className="swipe-actions">
          {/* Paret er det som sentreres; angre-knappen henger på utsiden til venstre */}
          <div className="swipe-actions__pair">
            <button
              type="button"
              className="round-btn round-btn--small swipe-actions__undo"
              aria-label="Angre forrige"
              onClick={() => dispatch({ type: 'undo' })}
              disabled={!canUndo}
            >
              <Undo2 size={20} />
            </button>
            <button type="button" className="round-btn" aria-label="Hopp over" onClick={() => swipeTop('pass')}>
              <X size={28} strokeWidth={2.6} />
            </button>
            <button type="button" className="round-btn round-btn--like" aria-label="Legg til venn" onClick={() => swipeTop('like')}>
              <UserPlus size={28} strokeWidth={2.4} />
            </button>
          </div>
        </div>
      )}
    </section>
  )
}

function SwipeCard({
  profile,
  shared,
  depth,
  active,
  onSwiped,
  ref,
}: {
  profile: Profile
  shared: string[]
  depth: number
  active: boolean
  onSwiped: (dir: 'like' | 'pass') => void
  ref?: Ref<CardHandle>
}) {
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-240, 240], [-14, 14])
  const likeOpacity = useTransform(x, [30, 120], [0, 1])
  const passOpacity = useTransform(x, [-120, -30], [1, 0])
  const leaving = useRef(false)

  const fly = (dir: 'like' | 'pass') => {
    if (leaving.current) return
    leaving.current = true
    animate(x, dir === 'like' ? 520 : -520, { duration: 0.32, ease: 'easeIn' }).then(() => onSwiped(dir))
  }
  useImperativeHandle(ref, () => ({ swipe: fly }))

  const others = profile.interests.filter((i) => !shared.includes(i))

  return (
    <motion.article
      className="card"
      aria-label={`${profile.name}, ${profile.age}`}
      style={{ x, rotate, zIndex: 10 - depth }}
      initial={{ scale: 0.94, y: 14, opacity: 0 }}
      animate={{ scale: 1 - depth * 0.04, y: depth * 14, opacity: depth > 1 ? 0 : 1 }}
      exit={{ opacity: 0, transition: { duration: 0.15 } }}
      transition={{ type: 'spring', damping: 26, stiffness: 260 }}
      drag={active ? 'x' : false}
      dragMomentum={false}
      onDragEnd={(_, info) => {
        if (info.offset.x > 110 || info.velocity.x > 600) fly('like')
        else if (info.offset.x < -110 || info.velocity.x < -600) fly('pass')
        else animate(x, 0, { type: 'spring', damping: 20, stiffness: 300 })
      }}
    >
      <div className="card__photo" style={{ background: colorFor(profile.id) }}>
        <img src={avatarUri(profile.id)} alt="" draggable={false} />
        <motion.span className="stamp stamp--like" style={{ opacity: likeOpacity }} aria-hidden>
          VENN
        </motion.span>
        <motion.span className="stamp stamp--pass" style={{ opacity: passOpacity }} aria-hidden>
          NEI TAKK
        </motion.span>
        <span className="card__shared">
          <Check size={14} strokeWidth={3} aria-hidden /> {shared.length} felles {shared.length === 1 ? 'interesse' : 'interesser'}
        </span>
      </div>
      <div className="card__info">
        <h2 className="card__name">
          {profile.name}, {profile.age}
        </h2>
        <p className="card__study">
          {profile.study} · {profile.year}. år
        </p>
        <p className="card__meta">
          <MapPin size={14} aria-hidden /> {profile.campus} · fra {profile.hometown}
          <span className="lang">{profile.languages.map((l) => l.toUpperCase()).join(' / ')}</span>
        </p>
        <p className="card__bio">{profile.bio}</p>
        <div className="tags-wrap">
          {shared.map((i) => (
            <span key={i} className="tag tag--match">
              <Check size={12} aria-hidden /> {interestLabel(i)}
            </span>
          ))}
          {others.map((i) => (
            <span key={i} className="tag">
              {interestLabel(i)}
            </span>
          ))}
        </div>
      </div>
    </motion.article>
  )
}

export function MatchOverlay({ onSayHi }: { onSayHi: (chatId: string) => void }) {
  const { state, dispatch } = useStore()
  const match = state.match
  const close = () => dispatch({ type: 'closeMatch' })

  return (
    <AnimatePresence>
      {match && (
        <motion.div
          className="match"
          role="dialog"
          aria-modal="true"
          aria-label="Ny match"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button type="button" className="icon-btn match__close" aria-label="Lukk og fortsett å swipe" onClick={close}>
            <X size={28} strokeWidth={2.4} />
          </button>

          <div className="match__avatars">
            <motion.div
              className="match__avatar"
              initial={{ x: -160, rotate: -18, opacity: 0 }}
              animate={{ x: 0, rotate: -6, opacity: 1 }}
              transition={{ type: 'spring', damping: 14, stiffness: 140, delay: 0.1 }}
            >
              <Avatar id="me" size={132} />
            </motion.div>
            <motion.div
              className="match__avatar"
              initial={{ x: 160, rotate: 18, opacity: 0 }}
              animate={{ x: 0, rotate: 6, opacity: 1 }}
              transition={{ type: 'spring', damping: 14, stiffness: 140, delay: 0.1 }}
            >
              <Avatar id={match.profileId} size={132} />
            </motion.div>
            <motion.span
              className="match__heart"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 9, stiffness: 260, delay: 0.55 }}
              aria-hidden
            >
              <UserPlus size={26} strokeWidth={2.4} />
            </motion.span>
          </div>

          <h2 className="match__title" aria-label="Amici match">
            {['AMICI', 'MATCH'].map((word, wi) => (
              <span key={word} className="match__line">
                {word.split('').map((ch, ci) => (
                  <motion.span
                    key={ci}
                    initial={{ y: 40, opacity: 0, rotate: -12 }}
                    animate={{ y: 0, opacity: 1, rotate: 0 }}
                    transition={{ type: 'spring', damping: 11, stiffness: 220, delay: 0.7 + wi * 0.25 + ci * 0.05 }}
                  >
                    {ch}
                  </motion.span>
                ))}
              </span>
            ))}
          </h2>

          <MatchText />

          <motion.button
            type="button"
            className="btn btn--light"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4 }}
            onClick={() => {
              const id = `c-direct-${match.profileId}`
              close()
              onSayHi(id)
            }}
          >
            Si hei
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function MatchText() {
  const { state } = useStore()
  const p = profiles.find((x) => x.id === state.match?.profileId)
  const group = state.chats.find((c) => c.id === state.match?.groupChatId)
  if (!p) return null
  return (
    <motion.p className="match__text" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}>
      Du og {p.name} vil gjerne bli kjent.
      {group ? ` Dere er nå med i ${group.name} sammen med en til!` : ' Én match til, så lager vi en gruppe.'}
    </motion.p>
  )
}
