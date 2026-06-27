import { describe, it, expect, vi, afterEach } from 'vitest'
import { renderHook, act, cleanup } from '@testing-library/react'
import { useLaunchStatus } from '../useLaunchStatus'
import { createProfileId } from '../../../../domain/profile'
import { Ok } from '../../../../shared/types/result'

afterEach(cleanup)

const PROFILE_ID = createProfileId('550e8400-e29b-41d4-a716-446655440001')

describe('useLaunchStatus — push notifications', () => {
  it('removes profileId from running set when status push is received', async () => {
    let statusCallback: ((data: { profileId: string; status: string }) => void) | null = null

    Object.defineProperty(window, 'claudeApi', {
      value: {
        profiles: {},
        launcher: {
          start: vi.fn().mockResolvedValue(Ok({ profileId: PROFILE_ID, pid: 12345, startedAt: new Date() })),
          stop: vi.fn().mockResolvedValue(Ok(undefined)),
          status: vi.fn(),
          onStatusChanged: vi.fn((cb: (data: { profileId: string; status: string }) => void) => {
            statusCallback = cb
            return () => { statusCallback = null }
          }),
        },
        settings: {},
      },
      writable: true,
      configurable: true,
    })

    const { result } = renderHook(() => useLaunchStatus())

    // Launch a profile
    await act(async () => {
      await result.current.launch(PROFILE_ID)
    })
    expect(result.current.runningProfileIds.has(PROFILE_ID)).toBe(true)

    // Simulate main process push notification (process crashed)
    act(() => {
      statusCallback?.({ profileId: PROFILE_ID, status: 'stopped' })
    })

    expect(result.current.runningProfileIds.has(PROFILE_ID)).toBe(false)
  })
})
