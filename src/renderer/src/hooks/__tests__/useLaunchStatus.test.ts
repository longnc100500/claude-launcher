import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, cleanup } from '@testing-library/react'
import { useLaunchStatus } from '../useLaunchStatus'
import { createProfileId } from '../../../../domain/profile'
import { Ok, Err } from '../../../../shared/types/result'

afterEach(cleanup)

const PROFILE_ID = createProfileId('550e8400-e29b-41d4-a716-446655440001')

function mockLauncherApi(
  startResult: unknown = Ok({ profileId: PROFILE_ID, pid: 12345, startedAt: new Date() }),
  stopResult: unknown = Ok(undefined),
): void {
  Object.defineProperty(window, 'claudeApi', {
    value: {
      profiles: {},
      launcher: {
        start: vi.fn().mockResolvedValue(startResult),
        stop: vi.fn().mockResolvedValue(stopResult),
        status: vi.fn(),
      },
      settings: {},
    },
    writable: true,
  })
}

describe('useLaunchStatus', () => {
  beforeEach(() => {
    mockLauncherApi()
  })

  it('starts with no running profiles', () => {
    const { result } = renderHook(() => useLaunchStatus())
    expect(result.current.runningProfileIds.size).toBe(0)
  })

  it('adds profileId to running set on successful launch', async () => {
    const { result } = renderHook(() => useLaunchStatus())
    await act(async () => {
      await result.current.launch(PROFILE_ID)
    })
    expect(result.current.runningProfileIds.has(PROFILE_ID)).toBe(true)
  })

  it('removes profileId from running set on stop', async () => {
    const { result } = renderHook(() => useLaunchStatus())
    await act(async () => { await result.current.launch(PROFILE_ID) })
    await act(async () => { await result.current.stop(PROFILE_ID) })
    expect(result.current.runningProfileIds.has(PROFILE_ID)).toBe(false)
  })

  it('sets error on failed launch', async () => {
    mockLauncherApi(Err(new Error('Binary not found')))
    const { result } = renderHook(() => useLaunchStatus())
    await act(async () => { await result.current.launch(PROFILE_ID) })
    expect(result.current.error).toBe('Binary not found')
  })
})
