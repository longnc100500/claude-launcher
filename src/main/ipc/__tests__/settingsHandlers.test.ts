import { describe, it, expect, beforeEach, vi } from 'vitest'
import { registerSettingsHandlers } from '../settingsHandlers'
import { MockIpcMain } from '../../../test/mocks/mockIpcMain'
import { IPC_CHANNELS } from '../../../shared/ipc/channels'
import type { ISettingsRepository } from '../../../domain/settings'
import type { AppSettings } from '../../../domain/settings'

const DEFAULT_SETTINGS: AppSettings = {
  claudeBinaryPath: null,
  dataDir: '/Users/test/.claude-launcher',
  launchOnStartup: false,
}

function makeMockRepo(): ISettingsRepository {
  return {
    get: vi.fn().mockResolvedValue(DEFAULT_SETTINGS),
    save: vi.fn().mockResolvedValue(undefined),
  }
}

describe('registerSettingsHandlers', () => {
  let ipcMain: MockIpcMain
  let settingsRepo: ISettingsRepository

  beforeEach(() => {
    ipcMain = new MockIpcMain()
    settingsRepo = makeMockRepo()
    registerSettingsHandlers(ipcMain as never, settingsRepo)
  })

  describe('settings:get', () => {
    it('registers the handler', () => {
      expect(ipcMain.hasHandler(IPC_CHANNELS.SETTINGS_GET)).toBe(true)
    })

    it('returns current settings', async () => {
      const result = await ipcMain.invoke(IPC_CHANNELS.SETTINGS_GET)
      expect((result as { ok: boolean; value: AppSettings }).ok).toBe(true)
      expect((result as { ok: boolean; value: AppSettings }).value).toEqual(DEFAULT_SETTINGS)
    })
  })

  describe('settings:save', () => {
    it('registers the handler', () => {
      expect(ipcMain.hasHandler(IPC_CHANNELS.SETTINGS_SAVE)).toBe(true)
    })

    it('saves valid settings', async () => {
      const newSettings: AppSettings = {
        claudeBinaryPath: '/Applications/Claude.app',
        dataDir: '/Users/test/.claude-launcher',
        launchOnStartup: true,
      }
      const result = await ipcMain.invoke(IPC_CHANNELS.SETTINGS_SAVE, newSettings)
      expect((result as { ok: boolean }).ok).toBe(true)
      expect(settingsRepo.save).toHaveBeenCalledWith(newSettings)
    })

    it('returns validation error for missing required fields', async () => {
      const result = await ipcMain.invoke(IPC_CHANNELS.SETTINGS_SAVE, {})
      expect((result as { ok: boolean }).ok).toBe(false)
    })
  })
})
