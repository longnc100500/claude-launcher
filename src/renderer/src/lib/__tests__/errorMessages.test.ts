import { describe, it, expect } from 'vitest'
import { getUserFriendlyError } from '../errorMessages'

describe('getUserFriendlyError', () => {
  it('returns a mapped message for a known error code', () => {
    const msg = getUserFriendlyError('BINARY_NOT_FOUND')
    expect(msg).toContain('Claude Desktop')
  })

  it('returns the fallback for an unknown error code', () => {
    const msg = getUserFriendlyError('UNKNOWN_CODE', 'Custom fallback')
    expect(msg).toBe('Custom fallback')
  })

  it('returns default message when no fallback and unknown code', () => {
    const msg = getUserFriendlyError('UNKNOWN_CODE')
    expect(msg).toBe('An unexpected error occurred.')
  })

  it('returns a mapped message for PROFILE_ALREADY_EXISTS', () => {
    const msg = getUserFriendlyError('PROFILE_ALREADY_EXISTS')
    expect(msg).toContain('already exists')
  })
})
