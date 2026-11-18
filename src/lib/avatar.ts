import { createAvatar } from '@dicebear/core'
import * as notionists from '@dicebear/notionists'

const cache = new Map<string, string>()

/** Illustrerte avatarer som lages lokalt, så demoen ikke bruker bilder av ekte personer. */
export function avatarUri(seed: string) {
  let uri = cache.get(seed)
  if (!uri) {
    uri = createAvatar(notionists, { seed, backgroundColor: ['transparent'] }).toDataUri()
    cache.set(seed, uri)
  }
  return uri
}
