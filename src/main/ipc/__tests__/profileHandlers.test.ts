import { describe, it, expect, beforeEach, vi } from 'vitest'
import { registerProfileHandlers } from '../profileHandlers'
import { MockIpcMain } from '../../../test/mocks/mockIpcMain'
import { IPC_CHANNELS } from '../../../shared/ipc/channels'
import { Ok, Err } from '../../../shared/types/result'
import { ProfileNotFoundError, ProfileAlreadyExistsError } from '../../../domain/errors'
import { createProfileId } from '../../../domain/profile'
import type { Profile } from '../../../domain/profile'
import type { ProfileService } from '../../../services/profileService'

const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000'

function makeMockProfile(name = 'Work'): Profile {
  return {
    id: createProfileId(VALID_UUID),
    name,
    homeDir: `/profiles/${name.toLowerCase()}`,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    lastUsedAt: null,
    color: null,
    icon: null,
  }
}

function makeMockService(): ProfileService {
  return {
    listProfiles: vi.fn().mockResolvedValue(Ok([])),
    getProfile: vi.fn().mockResolvedValue(Ok(makeMockProfile())),
    createProfile: vi.fn().mockResolvedValue(Ok(makeMockProfile())),
    updateProfile: vi.fn().mockResolvedValue(Ok(makeMockProfile())),
    deleteProfile: vi.fn().mockResolvedValue(Ok(undefined)),
    recordProfileUsage: vi.fn().mockResolvedValue(Ok(undefined)),
  } as unknown as ProfileService
}

describe('registerProfileHandlers', () => {
  let ipcMain: MockIpcMain
  let profileService: ProfileService

  beforeEach(() => {
    ipcMain = new MockIpcMain()
    profileService = makeMockService()
    registerProfileHandlers(ipcMain as never, profileService)
  })

  describe('profiles:list', () => {
    it('registers the handler', () => {
      expect(ipcMain.hasHandler(IPC_CHANNELS.PROFILES_LIST)).toBe(true)
    })

    it('calls profileService.listProfiles and returns the result', async () => {
      const profiles = [makeMockProfile()]
      vi.mocked(profileService.listProfiles).mockResolvedValue(Ok(profiles))
      const result = await ipcMain.invoke(IPC_CHANNELS.PROFILES_LIST)
      expect(profileService.listProfiles).toHaveBeenCalledOnce()
      expect(result).toEqual(Ok(profiles))
    })
  })

  describe('profiles:get', () => {
    it('registers the handler', () => {
      expect(ipcMain.hasHandler(IPC_CHANNELS.PROFILES_GET)).toBe(true)
    })

    it('calls getProfile with a valid id', async () => {
      const profile = makeMockProfile()
      vi.mocked(profileService.getProfile).mockResolvedValue(Ok(profile))
      const result = await ipcMain.invoke(IPC_CHANNELS.PROFILES_GET, { id: VALID_UUID })
      expect(profileService.getProfile).toHaveBeenCalledOnce()
      expect(result).toEqual(Ok(profile))
    })

    it('returns validation error for invalid input', async () => {
      const result = await ipcMain.invoke(IPC_CHANNELS.PROFILES_GET, { id: 'not-a-uuid' })
      expect((result as { ok: boolean }).ok).toBe(false)
      expect(profileService.getProfile).not.toHaveBeenCalled()
    })
  })

  describe('profiles:create', () => {
    it('registers the handler', () => {
      expect(ipcMain.hasHandler(IPC_CHANNELS.PROFILES_CREATE)).toBe(true)
    })

    it('calls createProfile with valid input', async () => {
      const profile = makeMockProfile()
      vi.mocked(profileService.createProfile).mockResolvedValue(Ok(profile))
      const result = await ipcMain.invoke(IPC_CHANNELS.PROFILES_CREATE, { name: 'Work' })
      expect(profileService.createProfile).toHaveBeenCalledWith({ name: 'Work' })
      expect(result).toEqual(Ok(profile))
    })

    it('returns validation error for missing name', async () => {
      const result = await ipcMain.invoke(IPC_CHANNELS.PROFILES_CREATE, {})
      expect((result as { ok: boolean }).ok).toBe(false)
      expect(profileService.createProfile).not.toHaveBeenCalled()
    })

    it('passes through service errors', async () => {
      vi.mocked(profileService.createProfile).mockResolvedValue(
        Err(new ProfileAlreadyExistsError('Work')),
      )
      const result = await ipcMain.invoke(IPC_CHANNELS.PROFILES_CREATE, { name: 'Work' })
      expect((result as { ok: boolean }).ok).toBe(false)
    })
  })

  describe('profiles:update', () => {
    it('registers the handler', () => {
      expect(ipcMain.hasHandler(IPC_CHANNELS.PROFILES_UPDATE)).toBe(true)
    })

    it('calls updateProfile with valid input', async () => {
      const profile = makeMockProfile('Personal')
      vi.mocked(profileService.updateProfile).mockResolvedValue(Ok(profile))
      const result = await ipcMain.invoke(IPC_CHANNELS.PROFILES_UPDATE, {
        id: VALID_UUID,
        updates: { name: 'Personal' },
      })
      expect(profileService.updateProfile).toHaveBeenCalledOnce()
      expect(result).toEqual(Ok(profile))
    })

    it('returns validation error for invalid id', async () => {
      const result = await ipcMain.invoke(IPC_CHANNELS.PROFILES_UPDATE, {
        id: 'bad-id',
        updates: { name: 'New' },
      })
      expect((result as { ok: boolean }).ok).toBe(false)
      expect(profileService.updateProfile).not.toHaveBeenCalled()
    })
  })

  describe('profiles:delete', () => {
    it('registers the handler', () => {
      expect(ipcMain.hasHandler(IPC_CHANNELS.PROFILES_DELETE)).toBe(true)
    })

    it('calls deleteProfile with valid id', async () => {
      const result = await ipcMain.invoke(IPC_CHANNELS.PROFILES_DELETE, { id: VALID_UUID })
      expect(profileService.deleteProfile).toHaveBeenCalledOnce()
      expect((result as { ok: boolean }).ok).toBe(true)
    })

    it('returns validation error for missing id', async () => {
      const result = await ipcMain.invoke(IPC_CHANNELS.PROFILES_DELETE, {})
      expect((result as { ok: boolean }).ok).toBe(false)
      expect(profileService.deleteProfile).not.toHaveBeenCalled()
    })

    it('passes through service errors', async () => {
      vi.mocked(profileService.deleteProfile).mockResolvedValue(
        Err(new ProfileNotFoundError(VALID_UUID)),
      )
      const result = await ipcMain.invoke(IPC_CHANNELS.PROFILES_DELETE, { id: VALID_UUID })
      expect((result as { ok: boolean }).ok).toBe(false)
    })
  })
})
