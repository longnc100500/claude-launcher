import { describe, it, expect, vi, afterEach } from 'vitest'
import { renderHook, act, waitFor, cleanup } from '@testing-library/react'
import { useSettings } from '../useSettings'
import { Ok, Err } from '../../../../shared/types/result'
import type { AppSettings } from '../../../../domain/settings'

afterEach(cleanup)

const DEFAULT_SETTINGS: AppSettings = {
  claudeBinaryPath: null,
  dataDir: '/tmp/.claude-launcher',
  launchOnStartup: false,
}

function mockSettingsApi(settings = DEFAULT_SETTINGS): void {
  Object.defineProperty(window, 'claudeApi', {
    value: {
      profiles: {},
      launcher: { onStatusChanged: vi.fn().mockReturnValue(() => {}) },
      settings: {
        get: vi.fn().mockResolvedValue(Ok(settings)),
        save: vi.fn().mockResolvedValue(Ok(undefined)),
      },
    },
    writable: true,
  })
}

describe('useSettings', () => {
  it('loads settings on mount', async () => {
    mockSettingsApi()
    const { result } = renderHook(() => useSettings())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.settings?.claudeBinaryPath).toBe(null)
  })

  it('saves settings and returns true on success', async () => {
    mockSettingsApi()
    const { result } = renderHook(() => useSettings())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    let saved = false
    await act(async () => {
      saved = await result.current.saveSettings({ ...DEFAULT_SETTINGS, claudeBinaryPath: '/custom/path' })
    })
    expect(saved).toBe(true)
    expect(result.current.settings?.claudeBinaryPath).toBe('/custom/path')
  })

  it('returns false and sets error on save failure', async () => {
    Object.defineProperty(window, 'claudeApi', {
      value: {
        profiles: {},
        launcher: { onStatusChanged: vi.fn().mockReturnValue(() => {}) },
        settings: {
          get: vi.fn().mockResolvedValue(Ok(DEFAULT_SETTINGS)),
          save: vi.fn().mockResolvedValue(Err(new Error('Save failed'))),
        },
      },
      writable: true,
    })
    const { result } = renderHook(() => useSettings())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    let saved = true
    await act(async () => {
      saved = await result.current.saveSettings(DEFAULT_SETTINGS)
    })
    expect(saved).toBe(false)
    expect(result.current.error).toBe('Save failed')
  })
})
