import type { AmiciEvent, Me, Profile } from '../types'
import { events, getProfile } from './data'

export const shared = (a: string[], b: string[]) => a.filter((x) => b.includes(x))

/** Forslag i swipe-bunken: filtrert på profilfiltrene og sortert etter antall felles interesser. */
export function candidates(me: Me, all: Profile[], swiped: Record<string, 'like' | 'pass'>) {
  const f = me.filters
  return all
    .filter((p) => !me.connections.includes(p.id) && !swiped[p.id])
    .filter((p) => p.age >= f.ageMin && p.age <= f.ageMax)
    .filter((p) => f.campuses.length === 0 || f.campuses.includes(p.campus))
    .filter((p) => f.languages.length === 0 || p.languages.some((l) => f.languages.includes(l)))
    .map((p) => ({ profile: p, shared: shared(me.interests, p.interests) }))
    .filter((c) => c.shared.length >= f.minShared)
    .sort((a, b) => b.shared.length - a.shared.length || a.profile.age - b.profile.age)
}

/** Interesser som minst to i gruppa har til felles, med hvor mange som har dem. */
export function groupInterestCounts(me: Me, memberIds: string[]) {
  const lists = [me.interests, ...memberIds.map((id) => getProfile(id)?.interests ?? [])]
  const counts = new Map<string, number>()
  for (const list of lists) for (const i of list) counts.set(i, (counts.get(i) ?? 0) + 1)
  return [...counts.entries()].filter(([, n]) => n >= 2).sort((a, b) => b[1] - a[1])
}

/** Tre arrangementer basert på det gruppa har felles. */
export function suggestEventsForGroup(me: Me, memberIds: string[], n = 3): AmiciEvent[] {
  const common = new Map(groupInterestCounts(me, memberIds))
  return events
    .map((e) => ({ e, score: e.interests.reduce((s, i) => s + (common.get(i) ?? 0), 0) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.e.dayOffset - b.e.dayOffset)
    .slice(0, n)
    .map((x) => x.e)
}

export function eventScore(me: Me, e: AmiciEvent) {
  return shared(me.interests, e.interests).length
}
