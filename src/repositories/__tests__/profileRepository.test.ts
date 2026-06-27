import { describe, it, expect, beforeEach } from 'vitest'
import { ProfileRepository } from '../profileRepository'
import { MockStore } from '../../test/mocks/mockStore'
import { createProfileId } from '../../domain/profile'
import type { Profile } from '../../domain/profile'

function makeProfile(overrides: Partial<Profile> = {}): Profile {
  return {
    id: createProfileId('550e8400-e29b-41d4-a716-446655440001'),
    name: 'Work',
    homeDir: '/home/profiles/work',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    lastUsedAt: null,
    color: null,
    icon: null,
    ...overrides,
  }
}

describe('ProfileRepository', () => {
  let store: MockStore
  let repo: ProfileRepository

  beforeEach(() => {
    store = new MockStore()
    repo = new ProfileRepository(store as never)
  })

  describe('findAll', () => {
    it('returns an empty array when store is empty', async () => {
      const result = await repo.findAll()
      expect(result).toEqual([])
    })

    it('returns all stored profiles', async () => {
      const profile = makeProfile()
      await repo.save(profile)
      const result = await repo.findAll()
      expect(result).toHaveLength(1)
    })

    it('sorts by lastUsedAt descending, then by createdAt', async () => {
      const older = makeProfile({
        id: createProfileId('550e8400-e29b-41d4-a716-446655440001'),
        name: 'Older',
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        lastUsedAt: new Date('2026-06-01T00:00:00.000Z'),
      })
      const newer = makeProfile({
        id: createProfileId('550e8400-e29b-41d4-a716-446655440002'),
        name: 'Newer',
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        lastUsedAt: new Date('2026-06-27T00:00:00.000Z'),
      })
      await repo.save(older)
      await repo.save(newer)
      const result = await repo.findAll()
      expect(result[0]?.name).toBe('Newer')
      expect(result[1]?.name).toBe('Older')
    })
  })

  describe('findById', () => {
    it('returns null for a non-existent id', async () => {
      const result = await repo.findById(createProfileId('550e8400-e29b-41d4-a716-446655440099'))
      expect(result).toBeNull()
    })

    it('returns the profile when it exists', async () => {
      const profile = makeProfile()
      await repo.save(profile)
      const result = await repo.findById(profile.id)
      expect(result?.name).toBe('Work')
    })
  })

  describe('save', () => {
    it('saves a new profile', async () => {
      const profile = makeProfile()
      await repo.save(profile)
      expect(await repo.exists(profile.id)).toBe(true)
    })

    it('updates an existing profile', async () => {
      const profile = makeProfile()
      await repo.save(profile)
      const updated = { ...profile, name: 'Personal' }
      await repo.save(updated)
      const result = await repo.findById(profile.id)
      expect(result?.name).toBe('Personal')
    })

    it('correctly serializes and deserializes dates', async () => {
      const date = new Date('2026-06-27T10:30:00.000Z')
      const profile = makeProfile({ createdAt: date, lastUsedAt: date })
      await repo.save(profile)
      const result = await repo.findById(profile.id)
      expect(result?.createdAt.toISOString()).toBe(date.toISOString())
      expect(result?.lastUsedAt?.toISOString()).toBe(date.toISOString())
    })

    it('handles null lastUsedAt correctly', async () => {
      const profile = makeProfile({ lastUsedAt: null })
      await repo.save(profile)
      const result = await repo.findById(profile.id)
      expect(result?.lastUsedAt).toBeNull()
    })
  })

  describe('delete', () => {
    it('removes an existing profile', async () => {
      const profile = makeProfile()
      await repo.save(profile)
      await repo.delete(profile.id)
      expect(await repo.exists(profile.id)).toBe(false)
    })

    it('is a no-op for a non-existent profile', async () => {
      const id = createProfileId('550e8400-e29b-41d4-a716-446655440099')
      await expect(repo.delete(id)).resolves.toBeUndefined()
    })
  })

  describe('exists', () => {
    it('returns false for a non-existent profile', async () => {
      const id = createProfileId('550e8400-e29b-41d4-a716-446655440099')
      expect(await repo.exists(id)).toBe(false)
    })

    it('returns true for an existing profile', async () => {
      const profile = makeProfile()
      await repo.save(profile)
      expect(await repo.exists(profile.id)).toBe(true)
    })
  })
})
