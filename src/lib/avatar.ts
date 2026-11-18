import { createAvatar } from '@dicebear/core'
import * as notionists from '@dicebear/notionists'
import type { Options as NotionistsOptions } from '@dicebear/notionists'
import type { AvatarLook } from '../types'

type HairVariant = NotionistsOptions['hair']

/** Alle øyenbryn unntatt monobrynet (variant03) og det sinte, sammentrukne (variant11) */
const BROWS = ['variant01', 'variant02', 'variant04', 'variant05', 'variant06', 'variant07', 'variant08', 'variant09', 'variant10', 'variant12', 'variant13'] as NotionistsOptions['brows']

/** Bare de runde, åpne øynene. De andre er halvlukkede og ser trøtte eller likegyldige ut */
const EYES = ['variant04', 'variant05'] as NotionistsOptions['eyes']

const cache = new Map<string, string>()

/**
 * Illustrerte avatarer som lages lokalt, så demoen ikke bruker bilder av ekte personer.
 * Utseendet (hår, skjegg, briller) settes per profil i JSON-dataene. Resten varieres av seed.
 */
export function avatarUri(seed: string, look?: AvatarLook) {
  const key = `${seed}|${look?.hair ?? ''}|${look?.beard ? 1 : 0}|${look?.glasses ? 1 : 0}`
  let uri = cache.get(key)
  if (!uri) {
    uri = createAvatar(notionists, {
      seed,
      backgroundColor: ['transparent'],
      brows: BROWS,
      eyes: EYES,
      ...(look && {
        hair: [look.hair] as HairVariant,
        beardProbability: look.beard ? 100 : 0,
        glassesProbability: look.glasses ? 100 : 0,
      }),
    }).toDataUri()
    cache.set(key, uri)
  }
  return uri
}
