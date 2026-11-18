import { createContext, useContext, useEffect, useReducer, type ReactNode } from 'react'
import type { Chat, Filters, Message } from '../types'
import { events, getProfile, groupNames, initialMe, interestLabel, listLabels, seedChats } from '../lib/data'
import { groupInterestCounts, shared, suggestEventsForGroup } from '../lib/match'

type Swipe = 'like' | 'pass'

export type State = {
  me: typeof initialMe
  swiped: Record<string, Swipe>
  history: string[]
  pendingMatches: string[]
  chats: Chat[]
  joined: string[]
  spots: Record<string, number>
  groupsCreated: number
  nextId: number
  /** Kortvarig: vises som match-animasjon, lagres ikke. */
  match: { profileId: string; groupChatId?: string } | null
  groupToast: string | null
}

type Action =
  | { type: 'swipe'; id: string; dir: Swipe }
  | { type: 'undo' }
  | { type: 'resetDeck' }
  | { type: 'toggleInterest'; id: string }
  | { type: 'setFilters'; filters: Partial<Filters> }
  | { type: 'setBio'; bio: string }
  | { type: 'send'; chatId: string; from: string; text: string }
  | { type: 'shareEvent'; chatId: string; eventId: string }
  | { type: 'read'; chatId: string }
  | { type: 'toggleJoin'; eventId: string }
  | { type: 'closeMatch' }
  | { type: 'closeToast' }
  | { type: 'reset' }

const STORAGE_KEY = 'amici-demo-v1'

function initialState(): State {
  const now = Date.now()
  let n = 0
  const chats: Chat[] = seedChats.map((c) => ({
    id: c.id,
    type: c.type as Chat['type'],
    name: c.name,
    colorIndex: c.colorIndex,
    memberIds: c.memberIds,
    unread: c.unread,
    messages: c.messages.map((m) => ({
      id: `seed-${n++}`,
      from: m.from,
      at: now - m.minutesAgo * 60_000,
      kind: m.from === 'system' ? 'system' : 'text',
      text: m.text,
    })),
  }))
  return {
    me: structuredClone(initialMe),
    swiped: {},
    history: [],
    pendingMatches: [],
    chats,
    joined: [],
    spots: Object.fromEntries(events.filter((e) => e.spotsLeft != null).map((e) => [e.id, e.spotsLeft!])),
    groupsCreated: 0,
    nextId: 1,
    match: null,
    groupToast: null,
  }
}

function load(): State {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return { ...initialState(), ...JSON.parse(raw), match: null, groupToast: null }
  } catch {
    /* privat modus eller blokkert lagring: start med ferske demodata */
  }
  return initialState()
}

const msg = (s: State, m: Omit<Message, 'id' | 'at'>): Message => ({ ...m, id: `m${s.nextId++}`, at: Date.now() })

function reducer(prev: State, a: Action): State {
  const s: State = { ...prev }
  switch (a.type) {
    case 'swipe': {
      s.swiped = { ...s.swiped, [a.id]: a.dir }
      s.history = [...s.history, a.id]
      const p = getProfile(a.id)
      if (a.dir !== 'like' || !p?.likesYou) return s

      // Match: egen chat med personen
      const common = shared(s.me.interests, p.interests).map(interestLabel)
      const direct: Chat = {
        id: `c-direct-${p.id}`,
        type: 'direct',
        memberIds: ['me', p.id],
        unread: 1,
        messages: [
          msg(s, {
            from: 'system',
            kind: 'system',
            text: common.length
              ? `Dere matchet! Felles interesser: ${listLabels(common).toLowerCase()}.`
              : 'Dere matchet!',
          }),
        ],
      }
      s.chats = [direct, ...s.chats.filter((c) => c.id !== direct.id)]
      s.me = { ...s.me, connections: [...s.me.connections, p.id] }
      s.pendingMatches = [...s.pendingMatches, p.id]
      s.match = { profileId: p.id }

      // To matcher gir automatisk en gruppe
      if (s.pendingMatches.length >= 2) {
        const members = s.pendingMatches.slice(0, 2)
        s.pendingMatches = s.pendingMatches.slice(2)
        const colorIndex = s.groupsCreated % groupNames.length
        const name = `Gruppe ${groupNames[colorIndex].name}`
        s.groupsCreated += 1
        const commonLabels = groupInterestCounts(s.me, members).slice(0, 3).map(([id]) => interestLabel(id).toLowerCase())
        const names = members.map((id) => getProfile(id)?.name ?? '')
        const suggestions = suggestEventsForGroup(s.me, members)
        const group: Chat = {
          id: `c-group-${s.nextId++}`,
          type: 'group',
          name,
          colorIndex,
          memberIds: ['me', ...members],
          unread: 2,
          messages: [
            msg(s, {
              from: 'system',
              kind: 'system',
              text: `Velkommen til ${name}! Du, ${listLabels(names)} matchet alle sammen${
                commonLabels.length ? ` og har ${listLabels(commonLabels)} til felles` : ''
              }.`,
            }),
            msg(s, { from: 'system', kind: 'suggestions', eventIds: suggestions.map((e) => e.id) }),
          ],
        }
        s.chats = [group, ...s.chats]
        s.match = { profileId: p.id, groupChatId: group.id }
      }
      return s
    }
    case 'undo': {
      const last = s.history[s.history.length - 1]
      if (!last || s.swiped[last] !== 'pass') return prev
      const { [last]: _removed, ...rest } = s.swiped
      void _removed
      s.swiped = rest
      s.history = s.history.slice(0, -1)
      return s
    }
    case 'resetDeck': {
      s.swiped = Object.fromEntries(Object.entries(s.swiped).filter(([, d]) => d === 'like'))
      s.history = []
      return s
    }
    case 'toggleInterest': {
      const has = s.me.interests.includes(a.id)
      s.me = { ...s.me, interests: has ? s.me.interests.filter((i) => i !== a.id) : [...s.me.interests, a.id] }
      return s
    }
    case 'setFilters':
      s.me = { ...s.me, filters: { ...s.me.filters, ...a.filters } }
      return s
    case 'setBio':
      s.me = { ...s.me, bio: a.bio }
      return s
    case 'send':
    case 'shareEvent': {
      s.chats = s.chats.map((c) => {
        if (c.id !== a.chatId) return c
        const m =
          a.type === 'send'
            ? msg(s, { from: a.from, kind: 'text', text: a.text })
            : msg(s, { from: 'me', kind: 'suggestions', eventIds: [a.eventId] })
        return { ...c, messages: [...c.messages, m] }
      })
      const chat = s.chats.find((c) => c.id === a.chatId)
      if (chat) s.chats = [chat, ...s.chats.filter((c) => c.id !== a.chatId)]
      return s
    }
    case 'read':
      s.chats = s.chats.map((c) => (c.id === a.chatId ? { ...c, unread: 0 } : c))
      return s
    case 'toggleJoin': {
      const joined = s.joined.includes(a.eventId)
      s.joined = joined ? s.joined.filter((id) => id !== a.eventId) : [...s.joined, a.eventId]
      if (a.eventId in s.spots) s.spots = { ...s.spots, [a.eventId]: s.spots[a.eventId] + (joined ? 1 : -1) }
      return s
    }
    case 'closeMatch':
      s.groupToast = s.match?.groupChatId ?? s.groupToast
      s.match = null
      return s
    case 'closeToast':
      s.groupToast = null
      return s
    case 'reset':
      return initialState()
  }
}

const Ctx = createContext<{ state: State; dispatch: (a: Action) => void } | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, load)
  useEffect(() => {
    try {
      const { match: _m, groupToast: _t, ...persist } = state
      void _m
      void _t
      localStorage.setItem(STORAGE_KEY, JSON.stringify(persist))
    } catch {
      /* lagring er bare en bekvemmelighet i demoen */
    }
  }, [state])
  return <Ctx.Provider value={{ state, dispatch }}>{children}</Ctx.Provider>
}

export function useStore() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useStore må brukes inne i StoreProvider')
  return v
}
