import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCreateProfile } from '../useCreateProfile'
import { createProfileId } from '../../../../domain/profile'
import type { Profile } from '../../../../domain/profile'
import { Ok, Err } from '../../../../shared/types/result'

function makeProfile(): Profile {
  return {
    id: createProfileId('550e8400-e29b-41d4-a716-446655440001'),
    name: 'Work',
    homeDir: '/profiles/work',
    createdAt: new Date('2026-01-01'),
    lastUsedAt: null,
    color: null,
    icon: null,
  }
}

describe('useCreateProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('starts in idle state', () => {
    const { result } = renderHook(() => useCreateProfile())
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('returns the created profile on success', async () => {
    const profile = makeProfile()
    Object.defineProperty(window, 'claudeApi', {
      value: { profiles: { create: vi.fn().mockResolvedValue(Ok(profile)) }, launcher: {}, settings: {} },
      writable: true,
      configurable: true,
    })
    const { result } = renderHook(() => useCreateProfile())
    const created: { value: Profile | null } = { value: null }
    await act(async () => {
      created.value = await result.current.createProfile({ name: 'Work' })
    })
    expect(created.value?.name).toBe('Work')
    expect(result.current.error).toBeNull()
  })

  it('sets error state on failure', async () => {
    Object.defineProperty(window, 'claudeApi', {
      value: { profiles: { create: vi.fn().mockResolvedValue(Err(new Error('Duplicate name'))) }, launcher: {}, settings: {} },
      writable: true,
      configurable: true,
    })
    const { result } = renderHook(() => useCreateProfile())
    await act(async () => {
      await result.current.createProfile({ name: 'Work' })
    })
    expect(result.current.error).toBe('Duplicate name')
  })

  it('reset clears the error', async () => {
    Object.defineProperty(window, 'claudeApi', {
      value: { profiles: { create: vi.fn().mockResolvedValue(Err(new Error('fail'))) }, launcher: {}, settings: {} },
      writable: true,
      configurable: true,
    })
    const { result } = renderHook(() => useCreateProfile())
    await act(async () => { await result.current.createProfile({ name: 'X' }) })
    act(() => { result.current.reset() })
    expect(result.current.error).toBeNull()
  })
})
