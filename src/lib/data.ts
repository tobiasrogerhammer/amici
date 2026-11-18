import interestsData from '../data/interests.json'
import meData from '../data/me.json'
import profilesData from '../data/profiles.json'
import eventsData from '../data/events.json'
import chatsData from '../data/chats.json'
import type { AmiciEvent, Category, GroupName, Interest, Me, Profile } from '../types'

export const categories = interestsData.categories as Category[]
export const interests = interestsData.interests as Interest[]
export const campuses = interestsData.campuses
export const languages = interestsData.languages
export const initialMe = meData as Me
export const profiles = profilesData as Profile[]
export const events = eventsData as AmiciEvent[]
export const groupNames = chatsData.groupNames as GroupName[]
export const icebreakers = chatsData.icebreakers
export const autoReplies = chatsData.autoReplies
export const seedChats = chatsData.chats

const interestById = new Map(interests.map((i) => [i.id, i]))
const profileById = new Map(profiles.map((p) => [p.id, p]))
const eventById = new Map(events.map((e) => [e.id, e]))

export const interestLabel = (id: string) => interestById.get(id)?.label ?? id
export const getProfile = (id: string) => profileById.get(id)
export const getEvent = (id: string) => eventById.get(id)

/** Profilene sin bakgrunnsfarge på kortet, fast per person. */
const cardColors = ['#F9CFC6', '#CFE0C9', '#CFE1F2', '#DCD2F2', '#B9DCD9', '#F3E2A8']
export const colorFor = (id: string) => {
  let h = 0
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return cardColors[h % cardColors.length]
}

export const listLabels = (labels: string[]) => {
  if (labels.length <= 1) return labels.join('')
  return `${labels.slice(0, -1).join(', ')} og ${labels[labels.length - 1]}`
}
