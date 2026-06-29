import { describe, it, expect, beforeEach, vi } from 'vitest'
import { registerLaunchHandlers } from '../launchHandlers'
import { MockIpcMain } from '../../../test/mocks/mockIpcMain'
import { MockLaunchService } from '../../../test/mocks/mockLaunchService'
import { IPC_CHANNELS } from '../../../shared/ipc/channels'
import type { ISettingsRepository } from '../../../domain/settings'
import type { AppSettings } from '../../../domain/settings'
import { createProfileId } from '../../../domain/profile'

const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000'
const VALID_PROFILE_ID = createProfileId(VALID_UUID)

const SETTINGS_WITH_BINARY: AppSettings = {
  claudeBinaryPath: '/Applications/Claude.app/Contents/MacOS/Claude',
  dataDir: '/Users/test/.claude-launcher',
  launchOnStartup: false,
}

const SETTINGS_WITHOUT_BINARY: AppSettings = {
  claudeBinaryPath: null,
  dataDir: '/Users/test/.claude-launcher',
  launchOnStartup: false,
}

function makeMockSettingsRepo(settings: AppSettings = SETTINGS_WITH_BINARY): ISettingsRepository {
  return {
    get: vi.fn().mockResolvedValue(settings),
    save: vi.fn().mockResolvedValue(undefined),
  }
}

describe('registerLaunchHandlers', () => {
  let ipcMain: MockIpcMain
  let launchService: MockLaunchService
  let settingsRepo: ISettingsRepository

  beforeEach(() => {
    ipcMain = new MockIpcMain()
    launchService = new MockLaunchService()
    settingsRepo = makeMockSettingsRepo()
    registerLaunchHandlers(ipcMain as never, launchService as never, settingsRepo)
  })

  describe('launcher:start', () => {
    it('registers the handler', () => {
      expect(ipcMain.hasHandler(IPC_CHANNELS.LAUNCHER_START)).toBe(true)
    })

    it('launches with valid profileId', async () => {
      const result = await ipcMain.invoke(IPC_CHANNELS.LAUNCHER_START, {
        profileId: VALID_UUID,
      })
      expect((result as { ok: boolean }).ok).toBe(true)
    })

    it('returns validation error for invalid profileId', async () => {
      const result = await ipcMain.invoke(IPC_CHANNELS.LAUNCHER_START, {
        profileId: 'not-a-uuid',
      })
      expect((result as { ok: boolean }).ok).toBe(false)
    })

    it('returns error when binary path is not configured', async () => {
      settingsRepo = makeMockSettingsRepo(SETTINGS_WITHOUT_BINARY)
      const ipc2 = new MockIpcMain()
      const ls2 = new MockLaunchService()
      registerLaunchHandlers(ipc2 as never, ls2 as never, settingsRepo)
      const result = await ipc2.invoke(IPC_CHANNELS.LAUNCHER_START, { profileId: VALID_UUID })
      expect((result as { ok: boolean }).ok).toBe(false)
    })

    it('passes binary path from settings to launchService', async () => {
      const launchSpy = vi.spyOn(launchService, 'launch')
      await ipcMain.invoke(IPC_CHANNELS.LAUNCHER_START, { profileId: VALID_UUID })
      expect(launchSpy).toHaveBeenCalledWith(
        VALID_PROFILE_ID,
        expect.objectContaining({
          claudeBinaryPath: SETTINGS_WITH_BINARY.claudeBinaryPath,
        }),
      )
    })
  })

  describe('launcher:stop', () => {
    it('registers the handler', () => {
      expect(ipcMain.hasHandler(IPC_CHANNELS.LAUNCHER_STOP)).toBe(true)
    })

    it('stops a running profile', async () => {
      // Start it first
      await ipcMain.invoke(IPC_CHANNELS.LAUNCHER_START, { profileId: VALID_UUID })
      const result = await ipcMain.invoke(IPC_CHANNELS.LAUNCHER_STOP, { id: VALID_UUID })
      expect((result as { ok: boolean }).ok).toBe(true)
    })

    it('returns error for invalid id', async () => {
      const result = await ipcMain.invoke(IPC_CHANNELS.LAUNCHER_STOP, { id: 'bad' })
      expect((result as { ok: boolean }).ok).toBe(false)
    })

    it('returns error when profile is not running', async () => {
      const result = await ipcMain.invoke(IPC_CHANNELS.LAUNCHER_STOP, { id: VALID_UUID })
      expect((result as { ok: boolean }).ok).toBe(false)
    })
  })

  describe('launcher:status', () => {
    it('registers the handler', () => {
      expect(ipcMain.hasHandler(IPC_CHANNELS.LAUNCHER_STATUS)).toBe(true)
    })

    it('returns stopped status for non-running profile', async () => {
      const result = await ipcMain.invoke(IPC_CHANNELS.LAUNCHER_STATUS, { id: VALID_UUID })
      expect((result as { ok: boolean; value: { status: string } }).ok).toBe(true)
      expect((result as { ok: boolean; value: { status: string } }).value.status).toBe('stopped')
    })

    it('returns running status after launch', async () => {
      await ipcMain.invoke(IPC_CHANNELS.LAUNCHER_START, { profileId: VALID_UUID })
      const result = await ipcMain.invoke(IPC_CHANNELS.LAUNCHER_STATUS, { id: VALID_UUID })
      expect((result as { ok: boolean; value: { status: string } }).ok).toBe(true)
      expect((result as { ok: boolean; value: { status: string } }).value.status).toBe('running')
    })

    it('returns error for invalid id', async () => {
      const result = await ipcMain.invoke(IPC_CHANNELS.LAUNCHER_STATUS, { id: '' })
      expect((result as { ok: boolean }).ok).toBe(false)
    })
  })
})
