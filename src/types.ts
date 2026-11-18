export type Interest = { id: string; label: string; category: string }
export type Category = { id: string; label: string; icon: string }

export type Profile = {
  id: string
  name: string
  age: number
  study: string
  year: number
  campus: string
  languages: string[]
  hometown: string
  bio: string
  interests: string[]
  likesYou: boolean
}

export type Filters = {
  ageMin: number
  ageMax: number
  campuses: string[]
  languages: string[]
  minShared: number
}

export type Me = {
  id: 'me'
  name: string
  age: number
  study: string
  year: number
  campus: string
  languages: string[]
  bio: string
  avatarSeed: string
  interests: string[]
  filters: Filters
  connections: string[]
}

export type AmiciEvent = {
  id: string
  kind: 'official' | 'group'
  title: string
  organizer: string
  hostMemberIds?: string[]
  spotsLeft?: number
  dayOffset: number
  time: string
  durationMin: number
  place: string
  area: string
  meetingPoint?: string
  price: number
  interests: string[]
  alcoholFree: boolean
  description: string
}

export type Message = {
  id: string
  from: string
  at: number
  kind: 'text' | 'system' | 'suggestions'
  text?: string
  eventIds?: string[]
}

export type Chat = {
  id: string
  type: 'group' | 'direct'
  name?: string
  colorIndex?: number
  memberIds: string[]
  unread: number
  messages: Message[]
}

export type GroupName = { name: string; color: string; ink: string }

export type Tab = 'discover' | 'events' | 'chats' | 'profile'
