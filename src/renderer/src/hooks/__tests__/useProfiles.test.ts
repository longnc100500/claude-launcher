import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useProfiles } from '../useProfiles'
import { createProfileId } from '../../../../domain/profile'
import type { Profile } from '../../../../domain/profile'
import { Ok, Err } from '../../../../shared/types/result'

function makeProfile(name = 'Work'): Profile {
  return {
    id: createProfileId('550e8400-e29b-41d4-a716-446655440001'),
    name,
    homeDir: '/profiles/work',
    createdAt: new Date('2026-01-01'),
    lastUsedAt: null,
    color: null,
    icon: null,
  }
}

function mockClaudeApi(profiles: Profile[] = []): void {
  Object.defineProperty(window, 'claudeApi', {
    value: {
      profiles: {
        list: vi.fn().mockResolvedValue(Ok(profiles)),
        get: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      launcher: {},
      settings: {},
    },
    writable: true,
    configurable: true,
  })
}

describe('useProfiles', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('starts in loading state', () => {
    mockClaudeApi()
    const { result } = renderHook(() => useProfiles())
    expect(result.current.isLoading).toBe(true)
  })

  it('loads profiles successfully', async () => {
    const profiles = [makeProfile('Work')]
    mockClaudeApi(profiles)
    const { result } = renderHook(() => useProfiles())
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    expect(result.current.profiles).toHaveLength(1)
    expect(result.current.profiles[0]?.name).toBe('Work')
    expect(result.current.error).toBeNull()
  })

  it('sets error state on failure', async () => {
    Object.defineProperty(window, 'claudeApi', {
      value: {
        profiles: {
          list: vi.fn().mockResolvedValue(Err(new Error('Network error'))),
        },
        launcher: {},
        settings: {},
      },
      writable: true,
      configurable: true,
    })
    const { result } = renderHook(() => useProfiles())
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    expect(result.current.error).toBe('Network error')
    expect(result.current.profiles).toHaveLength(0)
  })

  it('refresh re-fetches profiles', async () => {
    const listMock = vi.fn().mockResolvedValue(Ok([]))
    Object.defineProperty(window, 'claudeApi', {
      value: { profiles: { list: listMock }, launcher: {}, settings: {} },
      writable: true,
      configurable: true,
    })
    const { result } = renderHook(() => useProfiles())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    act(() => { result.current.refresh() })
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(listMock).toHaveBeenCalledTimes(2)
  })
})
