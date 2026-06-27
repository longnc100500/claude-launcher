import { describe, it, expect, beforeEach, vi } from 'vitest'
import { LaunchService } from '../launchService'
import { MockFilesystemService } from '../../test/mocks/mockFilesystemService'
import { MockChildProcess } from '../../test/mocks/mockChildProcess'
import { MockStore } from '../../test/mocks/mockStore'
import { ProfileRepository } from '../../repositories/profileRepository'
import { ProfileService } from '../profileService'
import { createProfileId } from '../../domain/profile'
import type { Profile, ProfileId } from '../../domain/profile'

vi.mock('child_process', () => ({
  spawn: vi.fn(),
}))

import { spawn } from 'child_process'

const BINARY_PATH = '/Applications/Claude.app/Contents/MacOS/Claude'
const CONFIG = { claudeBinaryPath: BINARY_PATH }

function makeProfile(id: string, name: string): Profile {
  return {
    id: createProfileId(id),
    name,
    homeDir: `/profiles/${name.toLowerCase()}`,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    lastUsedAt: null,
    color: null,
    icon: null,
  }
}

async function seedProfile(
  profileService: ProfileService,
  profile: Profile,
  fs: MockFilesystemService,
): Promise<void> {
  fs.addDirectory(profile.homeDir)
  await (profileService as unknown as { repo: { save: (p: Profile) => Promise<void> } }).repo.save(
    profile,
  )
}

describe('LaunchService — cleanup', () => {
  let fs: MockFilesystemService
  let launchService: LaunchService
  let profileService: ProfileService

  beforeEach(() => {
    fs = new MockFilesystemService()
    const store = new MockStore()
    const repo = new ProfileRepository(store as never)
    profileService = new ProfileService(repo, fs, { profilesBaseDir: '/profiles' })
    launchService = new LaunchService(profileService, fs)
    vi.mocked(spawn).mockReturnValue(new MockChildProcess(12345) as never)
  })

  it('getAllStatuses returns empty map when nothing is running', () => {
    const statuses = launchService.getAllStatuses()
    expect(statuses.size).toBe(0)
  })

  it('getAllStatuses shows all running processes', async () => {
    fs.addFile(BINARY_PATH)
    const p1 = makeProfile('550e8400-e29b-41d4-a716-446655440001', 'Work')
    const p2 = makeProfile('550e8400-e29b-41d4-a716-446655440002', 'Personal')
    await seedProfile(profileService, p1, fs)
    await seedProfile(profileService, p2, fs)

    await launchService.launch(p1.id, CONFIG)
    vi.mocked(spawn).mockReturnValue(new MockChildProcess(12346) as never)
    await launchService.launch(p2.id, CONFIG)

    const statuses = launchService.getAllStatuses()
    expect(statuses.size).toBe(2)
  })

  it('stop clears process from statuses', async () => {
    fs.addFile(BINARY_PATH)
    const p1 = makeProfile('550e8400-e29b-41d4-a716-446655440001', 'Work')
    await seedProfile(profileService, p1, fs)
    await launchService.launch(p1.id, CONFIG)

    launchService.stop(p1.id)
    const statuses = launchService.getAllStatuses()
    expect(statuses.size).toBe(0)
  })

  it('cleanup loop stops all running processes', async () => {
    fs.addFile(BINARY_PATH)
    const p1 = makeProfile('550e8400-e29b-41d4-a716-446655440001', 'Work')
    const p2 = makeProfile('550e8400-e29b-41d4-a716-446655440002', 'Personal')
    await seedProfile(profileService, p1, fs)
    await seedProfile(profileService, p2, fs)

    await launchService.launch(p1.id, CONFIG)
    vi.mocked(spawn).mockReturnValue(new MockChildProcess(12346) as never)
    await launchService.launch(p2.id, CONFIG)

    // Simulate before-quit cleanup
    for (const [profileId] of launchService.getAllStatuses()) {
      launchService.stop(profileId as ProfileId)
    }

    expect(launchService.getAllStatuses().size).toBe(0)
  })
})
