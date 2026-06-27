import { describe, it, expect } from 'vitest'
import { now, formatRelative } from '../date'

describe('now', () => {
  it('returns a Date close to the current time', () => {
    const before = Date.now()
    const result = now()
    const after = Date.now()
    expect(result.getTime()).toBeGreaterThanOrEqual(before)
    expect(result.getTime()).toBeLessThanOrEqual(after)
  })
})

describe('formatRelative', () => {
  it('returns "just now" for a date less than 60 seconds ago', () => {
    const date = new Date(Date.now() - 30 * 1000)
    expect(formatRelative(date)).toBe('just now')
  })

  it('returns "1 minute ago" for a date 1 minute ago', () => {
    const date = new Date(Date.now() - 60 * 1000)
    expect(formatRelative(date)).toBe('1 minute ago')
  })

  it('returns "5 minutes ago" for a date 5 minutes ago', () => {
    const date = new Date(Date.now() - 5 * 60 * 1000)
    expect(formatRelative(date)).toBe('5 minutes ago')
  })

  it('returns "1 hour ago" for a date 1 hour ago', () => {
    const date = new Date(Date.now() - 60 * 60 * 1000)
    expect(formatRelative(date)).toBe('1 hour ago')
  })

  it('returns "3 hours ago" for a date 3 hours ago', () => {
    const date = new Date(Date.now() - 3 * 60 * 60 * 1000)
    expect(formatRelative(date)).toBe('3 hours ago')
  })

  it('returns "1 day ago" for a date 1 day ago', () => {
    const date = new Date(Date.now() - 24 * 60 * 60 * 1000)
    expect(formatRelative(date)).toBe('1 day ago')
  })

  it('returns a locale date string for dates more than 30 days ago', () => {
    const date = new Date(Date.now() - 31 * 24 * 60 * 60 * 1000)
    const result = formatRelative(date)
    expect(result).not.toContain('ago')
    expect(result).not.toBe('just now')
  })
})
