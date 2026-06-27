import { describe, it, expect } from 'vitest'
import { generateId, generateProfileId } from '../id'

describe('generateId', () => {
  it('returns a string', () => {
    expect(typeof generateId()).toBe('string')
  })

  it('returns a valid UUID format', () => {
    const id = generateId()
    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/)
  })

  it('returns a unique value each call', () => {
    const id1 = generateId()
    const id2 = generateId()
    expect(id1).not.toBe(id2)
  })
})

describe('generateProfileId', () => {
  it('returns a ProfileId string', () => {
    const id = generateProfileId()
    expect(typeof id).toBe('string')
  })

  it('returns a valid UUID format', () => {
    const id = generateProfileId()
    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/)
  })
})
