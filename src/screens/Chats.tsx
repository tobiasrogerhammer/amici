import { AnimatePresence, motion } from 'motion/react'
import { ChevronLeft, RefreshCw, Send, Smile, Sparkles } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Avatar, GroupAvatar } from '../components/Avatar'
import { EventCard } from '../components/EventCard'
import { autoReplies, getEvent, getProfile, groupNames, icebreakers, interestLabel, listLabels } from '../lib/data'
import { groupInterestCounts } from '../lib/match'
import { chatTime } from '../lib/time'
import { useStore } from '../state/store'
import type { AmiciEvent, Chat, Message } from '../types'

type Filter = 'all' | 'group' | 'direct'

export const chatTitle = (c: Chat) =>
  c.type === 'group' ? c.name ?? 'Gruppe' : getProfile(c.memberIds.find((m) => m !== 'me')!)?.name ?? 'Chat'

function preview(c: Chat) {
  const m = c.messages[c.messages.length - 1]
  if (!m) return ''
  if (m.kind === 'suggestions') return m.from === 'me' ? 'Du delte et arrangement' : 'Amici: 3 forslag til arrangementer'
  const who = m.from === 'me' ? 'Du: ' : m.from === 'system' ? '' : c.type === 'group' ? `${getProfile(m.from)?.name}: ` : ''
  return who + m.text
}

export function Chats({
  openChatId,
  setOpenChatId,
  onOpenEvent,
}: {
  openChatId: string | null
  setOpenChatId: (id: string | null) => void
  onOpenEvent: (e: AmiciEvent) => void
}) {
  const { state } = useStore()
  const [filter, setFilter] = useState<Filter>('all')
  const list = state.chats.filter((c) => filter === 'all' || c.type === filter)
  const open = state.chats.find((c) => c.id === openChatId)

  return (
    <section className="screen" aria-label="Chats">
      <header className="page-header">
        <h1>Chats</h1>
        <div className="segmented" role="tablist" aria-label="Filtrer chatter">
          {(
            [
              ['all', 'Alle'],
              ['group', 'Grupper'],
              ['direct', 'Venner'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={filter === id}
              className={filter === id ? 'is-active' : ''}
              onClick={() => setFilter(id)}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      <ul className="chat-list" inert={open != null}>
        {list.map((c) => (
          <li key={c.id}>
            <button type="button" className="chat-row" onClick={() => setOpenChatId(c.id)}>
              {c.type === 'group' ? <GroupAvatar chat={c} size={54} /> : <Avatar id={c.memberIds[1]} size={54} />}
              <span className="chat-row__body">
                <span className="chat-row__top">
                  <span className="chat-row__name">{chatTitle(c)}</span>
                  <span className="chat-row__time">{chatTime(c.messages[c.messages.length - 1]?.at ?? Date.now())}</span>
                </span>
                <span className={`chat-row__preview${c.unread ? ' is-unread' : ''}`}>{preview(c)}</span>
              </span>
              {c.unread > 0 && (
                <span className="unread" aria-label={`${c.unread} uleste`}>
                  {c.unread}
                </span>
              )}
            </button>
          </li>
        ))}
        {list.length === 0 && <li className="muted center pad">Ingen chatter her ennå. Swipe for å finne nye venner!</li>}
      </ul>

      <AnimatePresence>
        {open && <ChatView key={open.id} chat={open} onBack={() => setOpenChatId(null)} onOpenEvent={onOpenEvent} />}
      </AnimatePresence>
    </section>
  )
}

function ChatView({ chat, onBack, onOpenEvent }: { chat: Chat; onBack: () => void; onOpenEvent: (e: AmiciEvent) => void }) {
  const { state, dispatch } = useStore()
  const [text, setText] = useState('')
  const [typing, setTyping] = useState<string | null>(null)
  const [ice, setIce] = useState(() => Math.floor(Math.random() * icebreakers.length))
  const endRef = useRef<HTMLDivElement>(null)
  const others = chat.memberIds.filter((m) => m !== 'me')
  const timers = useRef<number[]>([])

  useEffect(() => {
    dispatch({ type: 'read', chatId: chat.id })
  }, [chat.id, chat.messages.length, dispatch])
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [chat.messages.length, typing])
  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  const common = useMemo(
    () => (chat.type === 'group' ? groupInterestCounts(state.me, others).slice(0, 4).map(([id]) => interestLabel(id)) : []),
    [chat.type, state.me, others],
  )

  const send = (value: string) => {
    const t = value.trim()
    if (!t) return
    dispatch({ type: 'send', chatId: chat.id, from: 'me', text: t })
    setText('')
    // Demo: noen i chatten svarer etter et lite øyeblikk
    const responder = others[Math.floor(Math.random() * others.length)]
    timers.current.push(window.setTimeout(() => setTyping(responder), 700))
    timers.current.push(
      window.setTimeout(() => {
        setTyping(null)
        dispatch({ type: 'send', chatId: chat.id, from: responder, text: autoReplies[Math.floor(Math.random() * autoReplies.length)] })
      }, 2200),
    )
  }

  const color = chat.type === 'group' ? groupNames[chat.colorIndex ?? 0] : null
  const fewMessages = chat.messages.filter((m) => m.kind === 'text').length < 3

  return (
    <motion.div
      className="chat-view"
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 32, stiffness: 320 }}
    >
      <header className="chat-view__header">
        <button type="button" className="icon-btn" aria-label="Tilbake til chats" onClick={onBack}>
          <ChevronLeft size={28} />
        </button>
        {chat.type === 'group' ? <GroupAvatar chat={chat} size={40} /> : <Avatar id={others[0]} size={40} />}
        <div className="chat-view__title">
          <h2>{chatTitle(chat)}</h2>
          <p>
            {chat.type === 'group'
              ? `Du, ${listLabels(others.map((id) => getProfile(id)?.name ?? ''))}`
              : getProfile(others[0])?.study}
          </p>
        </div>
      </header>

      {common.length > 0 && (
        <div className="chat-view__common" style={{ background: color?.color, color: color?.ink }}>
          <Sparkles size={15} aria-hidden /> Felles: {listLabels(common.map((c) => c.toLowerCase()))}
        </div>
      )}

      <div className="messages">
        {chat.messages.map((m, i) => (
          <MessageItem key={m.id} m={m} chat={chat} prev={chat.messages[i - 1]} onOpenEvent={onOpenEvent} />
        ))}
        {typing && (
          <div className="msg msg--them">
            <Avatar id={typing} size={28} />
            <span className="bubble bubble--typing" aria-label={`${getProfile(typing)?.name} skriver`}>
              <span />
              <span />
              <span />
            </span>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {fewMessages && (
        <div className="icebreaker">
          <Smile size={20} aria-hidden />
          <div className="icebreaker__body">
            <p className="icebreaker__label">Isbryter</p>
            <p>{icebreakers[ice]}</p>
          </div>
          <div className="icebreaker__actions">
            <button type="button" className="icon-btn" aria-label="Ny isbryter" onClick={() => setIce((ice + 1) % icebreakers.length)}>
              <RefreshCw size={18} />
            </button>
            <button type="button" className="btn btn--small btn--secondary" onClick={() => send(icebreakers[ice])}>
              Send
            </button>
          </div>
        </div>
      )}

      <form
        className="composer"
        onSubmit={(e) => {
          e.preventDefault()
          send(text)
        }}
      >
        <label className="sr-only" htmlFor="composer-input">
          Skriv en melding
        </label>
        <input
          id="composer-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={chat.type === 'group' ? 'Si hei til gruppen' : 'Skriv en melding'}
          autoComplete="off"
        />
        <button type="submit" className="send-btn" aria-label="Send melding">
          <Send size={20} />
        </button>
      </form>
    </motion.div>
  )
}

function MessageItem({
  m,
  chat,
  prev,
  onOpenEvent,
}: {
  m: Message
  chat: Chat
  prev?: Message
  onOpenEvent: (e: AmiciEvent) => void
}) {
  const { state, dispatch } = useStore()

  if (m.kind === 'system') return <p className="msg-system">{m.text}</p>

  if (m.kind === 'suggestions') {
    const evs = (m.eventIds ?? []).map(getEvent).filter(Boolean) as AmiciEvent[]
    if (m.from === 'me')
      return (
        <div className="msg msg--me msg--card">
          {evs.map((e) => (
            <EventCard key={e.id} event={e} onOpen={onOpenEvent} compact />
          ))}
        </div>
      )
    return (
      <div className="suggestions">
        <p className="suggestions__title">
          <Sparkles size={16} aria-hidden /> Tre arrangementer for {chat.name}
        </p>
        <p className="suggestions__sub">Valgt ut fra interessene dere har til felles.</p>
        <div className="suggestions__list">
          {evs.map((e) => (
            <div key={e.id} className="suggestion">
              <EventCard event={e} onOpen={onOpenEvent} compact highlight={state.me.interests} />
              <button
                type="button"
                className="btn btn--small btn--primary"
                onClick={() => dispatch({ type: 'shareEvent', chatId: chat.id, eventId: e.id })}
              >
                Foreslå for gruppen
              </button>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const mine = m.from === 'me'
  const showAvatar = !mine && prev?.from !== m.from
  return (
    <div className={`msg ${mine ? 'msg--me' : 'msg--them'}`}>
      {!mine && (showAvatar ? <Avatar id={m.from} size={28} /> : <span className="msg__spacer" />)}
      <div>
        {chat.type === 'group' && showAvatar && <p className="msg__name">{getProfile(m.from)?.name}</p>}
        <p className="bubble">{m.text}</p>
      </div>
    </div>
  )
}
