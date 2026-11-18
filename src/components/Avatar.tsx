import { avatarUri } from '../lib/avatar'
import { colorFor, getProfile, groupNames } from '../lib/data'
import { useStore } from '../state/store'
import type { Chat } from '../types'

export function Avatar({ id, size = 44, ring = false }: { id: string; size?: number; ring?: boolean }) {
  const { state } = useStore()
  const isMe = id === 'me'
  const seed = isMe ? state.me.avatarSeed : id
  const profile = isMe ? undefined : getProfile(id)
  const name = isMe ? state.me.name : profile?.name ?? ''
  const look = isMe ? state.me.avatar : profile?.avatar
  return (
    <span
      className={`avatar${ring ? ' avatar--ring' : ''}`}
      style={{ width: size, height: size, background: colorFor(seed) }}
    >
      <img src={avatarUri(seed, look)} alt={name} width={size} height={size} draggable={false} />
    </span>
  )
}

/** To eller tre avatarer stablet, brukt for gruppechatter. */
export function GroupAvatar({ chat, size = 48 }: { chat: Chat; size?: number }) {
  const others = chat.memberIds.filter((m) => m !== 'me').slice(0, 2)
  const color = groupNames[chat.colorIndex ?? 0]?.color
  return (
    <span className="group-avatar" style={{ width: size, height: size, background: color }}>
      {others.map((id, i) => (
        <span key={id} className={`group-avatar__item group-avatar__item--${i}`}>
          <Avatar id={id} size={size * 0.62} />
        </span>
      ))}
    </span>
  )
}
