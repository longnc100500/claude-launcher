import { describe, it, expect, beforeEach, vi } from 'vitest'
import { LaunchService } from '../launchService'
import { MockFilesystemService } from '../../test/mocks/mockFilesystemService'
import { MockChildProcess } from '../../test/mocks/mockChildProcess'
import { MockStore } from '../../test/mocks/mockStore'
import { ProfileRepository } from '../../repositories/profileRepository'
import { ProfileService } from '../profileService'
import { createProfileId } from '../../domain/profile'
import type { Profile } from '../../domain/profile'

// Mock child_process.spawn
vi.mock('child_process', () => ({
  spawn: vi.fn(),
}))

import { spawn } from 'child_process'

const BINARY_PATH = '/Applications/Claude.app/Contents/MacOS/Claude'
const CONFIG = { claudeBinaryPath: BINARY_PATH }
const VALID_PROFILE_ID = createProfileId('550e8400-e29b-41d4-a716-446655440001')

function makeProfile(): Profile {
  return {
    id: VALID_PROFILE_ID,
    name: 'Work',
    homeDir: '/profiles/work',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    lastUsedAt: null,
    color: null,
    icon: null,
  }
}

describe('LaunchService', () => {
  let fs: MockFilesystemService
  let profileService: ProfileService
  let launchService: LaunchService
  let mockProcess: MockChildProcess

  beforeEach(() => {
    fs = new MockFilesystemService()
    const store = new MockStore()
    const repo = new ProfileRepository(store as never)
    profileService = new ProfileService(repo, fs, {
      profilesBaseDir: '/profiles',
    })
    launchService = new LaunchService(profileService, fs)
    mockProcess = new MockChildProcess(12345)
    vi.mocked(spawn).mockReturnValue(mockProcess as never)
  })

  describe('launch', () => {
    it('returns error when binary does not exist', async () => {
      const result = await launchService.launch(VALID_PROFILE_ID, CONFIG)
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error.code).toBe('BINARY_NOT_FOUND')
      }
    })

    it('returns error when profile does not exist', async () => {
      fs.addFile(BINARY_PATH)
      const result = await launchService.launch(VALID_PROFILE_ID, CONFIG)
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error.code).toBe('PROFILE_NOT_FOUND')
      }
    })

    it('spawns process with isolated user-data-dir', async () => {
      fs.addFile(BINARY_PATH)
      const profile = makeProfile()
      fs.addDirectory(profile.homeDir)
      await (profileService as unknown as { repo: { save: (p: Profile) => Promise<void> } }).repo.save(profile)

      const result = await launchService.launch(VALID_PROFILE_ID, CONFIG)
      expect(result.ok).toBe(true)

      expect(spawn).toHaveBeenCalledWith(
        BINARY_PATH,
        [`--user-data-dir=${profile.homeDir}/user-data`],
        expect.objectContaining({
          detached: true,
        }),
      )
    })

    it('returns error when process already running for profile', async () => {
      fs.addFile(BINARY_PATH)
      const profile = makeProfile()
      fs.addDirectory(profile.homeDir)
      await (profileService as unknown as { repo: { save: (p: Profile) => Promise<void> } }).repo.save(profile)

      await launchService.launch(VALID_PROFILE_ID, CONFIG)
      const result = await launchService.launch(VALID_PROFILE_ID, CONFIG)
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error.code).toBe('PROCESS_ALREADY_RUNNING')
      }
    })

    it('returns RunningProcess with pid on success', async () => {
      fs.addFile(BINARY_PATH)
      const profile = makeProfile()
      fs.addDirectory(profile.homeDir)
      await (profileService as unknown as { repo: { save: (p: Profile) => Promise<void> } }).repo.save(profile)

      const result = await launchService.launch(VALID_PROFILE_ID, CONFIG)
      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value.pid).toBe(12345)
        expect(result.value.profileId).toBe(VALID_PROFILE_ID)
      }
    })
  })

  describe('stop', () => {
    it('returns error when no process running', () => {
      const result = launchService.stop(VALID_PROFILE_ID)
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error.code).toBe('PROFILE_NOT_FOUND')
      }
    })

    it('kills the process and removes it from the map', async () => {
      fs.addFile(BINARY_PATH)
      const profile = makeProfile()
      fs.addDirectory(profile.homeDir)
      await (profileService as unknown as { repo: { save: (p: Profile) => Promise<void> } }).repo.save(profile)

      await launchService.launch(VALID_PROFILE_ID, CONFIG)
      const result = launchService.stop(VALID_PROFILE_ID)
      expect(result.ok).toBe(true)
      expect(mockProcess.killed).toBe(true)
    })
  })

  describe('getStatus', () => {
    it('returns stopped when no process running', () => {
      const status = launchService.getStatus(VALID_PROFILE_ID)
      expect(status.status).toBe('stopped')
    })

    it('returns running with pid when process is active', async () => {
      fs.addFile(BINARY_PATH)
      const profile = makeProfile()
      fs.addDirectory(profile.homeDir)
      await (profileService as unknown as { repo: { save: (p: Profile) => Promise<void> } }).repo.save(profile)

      await launchService.launch(VALID_PROFILE_ID, CONFIG)
      const status = launchService.getStatus(VALID_PROFILE_ID)
      expect(status.status).toBe('running')
      if (status.status === 'running') {
        expect(status.pid).toBe(12345)
      }
    })
  })
})
