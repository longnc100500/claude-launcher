import { describe, it, expect } from 'vitest'
import { createProfileId } from '../profile'

describe('ProfileId', () => {
  it('creates a profile id from a string', () => {
    const id = createProfileId('abc-123')
    expect(id).toBe('abc-123')
  })

  it('preserves the original string value', () => {
    const raw = 'some-uuid-value'
    const id = createProfileId(raw)
    expect(String(id)).toBe(raw)
  })
})
