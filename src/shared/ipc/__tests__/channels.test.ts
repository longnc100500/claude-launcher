import { describe, it, expect } from 'vitest'
import { IPC_CHANNELS } from '../channels'
import type { IpcChannel } from '../channels'

describe('IPC_CHANNELS', () => {
  it('has unique channel values', () => {
    const values = Object.values(IPC_CHANNELS)
    const unique = new Set(values)
    expect(unique.size).toBe(values.length)
  })

  it('uses domain:action format', () => {
    for (const channel of Object.values(IPC_CHANNELS)) {
      expect(channel).toMatch(/^[a-z]+:[a-z]+$/)
    }
  })

  it('has all expected channels', () => {
    expect(IPC_CHANNELS.PROFILES_LIST).toBe('profiles:list')
    expect(IPC_CHANNELS.PROFILES_CREATE).toBe('profiles:create')
    expect(IPC_CHANNELS.LAUNCHER_START).toBe('launcher:start')
    expect(IPC_CHANNELS.SETTINGS_GET).toBe('settings:get')
  })

  it('IpcChannel type covers all values', () => {
    // Type-level check — if this compiles, the type is correct
    const ch: IpcChannel = IPC_CHANNELS.PROFILES_LIST
    expect(ch).toBe('profiles:list')
  })
})
