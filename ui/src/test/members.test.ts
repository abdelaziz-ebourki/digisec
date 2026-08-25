import { describe, expect, it } from 'vitest'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { MEMBERS } from '@/data/members'

describe('members data', () => {
  it('contains the full bureau roster', () => {
    expect(MEMBERS).toHaveLength(14)
  })

  it('has unique ids and names', () => {
    const ids = MEMBERS.map((member) => member.id)
    const names = MEMBERS.map((member) => member.name)
    expect(new Set(ids).size).toBe(MEMBERS.length)
    expect(new Set(names).size).toBe(MEMBERS.length)
  })

  it('references photo files that exist on disk', () => {
    for (const member of MEMBERS) {
      const absolutePath = path.resolve(import.meta.dirname, '../../public', member.photo.slice(1))
      expect(existsSync(absolutePath), `missing photo for ${member.name}: ${member.photo}`).toBe(true)
    }
  })
})
