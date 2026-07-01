import { describe, it, expect, vi } from 'vitest'
import { MockFilesystemService } from '../../test/mocks/mockFilesystemService'
import { SessionSyncService } from '../sessionSyncService'
import type { IProfileRepository, Profile, ProfileId } from '../../domain/profile'
import { createProfileId } from '../../domain/profile'

function makeProfile(id: string, name: string): Profile {
  return {
    id: createProfileId(id),
    name,
    homeDir: `/profiles/${name}`,
    createdAt: new Date(),
    lastUsedAt: null,
    color: null,
    icon: null,
  }
}

function makeRepo(profiles: Profile[]): IProfileRepository {
  return {
    findAll: vi.fn().mockResolvedValue(profiles),
    findById: vi.fn().mockImplementation(async (id: ProfileId) =>
      profiles.find((p) => p.id === id) ?? null,
    ),
    save: vi.fn(),
    delete: vi.fn(),
    exists: vi.fn(),
  }
}

const SOURCE_ID = createProfileId('11111111-1111-1111-1111-111111111111')
const TARGET_ID = createProfileId('22222222-2222-2222-2222-222222222222')
const source = makeProfile(SOURCE_ID, 'work')
const target = makeProfile(TARGET_ID, 'personal')

// Helpers for setting up the correct directory structure:
//   <homeDir>/user-data/claude-code-sessions/<accountId>/<orgId>/local_<sessionId>.json
const ACCOUNT_ID = 'acc-111'
const ORG_ID = 'org-999'
const TARGET_ACCOUNT_ID = 'acc-222'
const TARGET_ORG_ID = 'org-888'

function srcBase(name: string) {
  return `/profiles/${name}/user-data/claude-code-sessions`
}
function srcAccountDir(name: string) {
  return `${srcBase(name)}/${ACCOUNT_ID}`
}
function srcOrgDir(name: string) {
  return `${srcBase(name)}/${ACCOUNT_ID}/${ORG_ID}`
}
function addOrgDir(mockFs: MockFilesystemService, name: string): void {
  mockFs.addDirectory(srcBase(name))
  mockFs.addDirectory(srcAccountDir(name))
  mockFs.addDirectory(srcOrgDir(name))
}

describe('SessionSyncService', () => {
  describe('listProjects', () => {
    it('should return empty array when source profile not found', async () => {
      const mockFs = new MockFilesystemService()
      const svc = new SessionSyncService(makeRepo([]), mockFs)

      const result = await svc.listProjects(SOURCE_ID)

      expect(result.ok).toBe(true)
      if (result.ok) expect(result.value).toEqual([])
    })

    it('should return empty array when sessions dir does not exist', async () => {
      const mockFs = new MockFilesystemService()
      const svc = new SessionSyncService(makeRepo([source]), mockFs)

      const result = await svc.listProjects(SOURCE_ID)

      expect(result.ok).toBe(true)
      if (result.ok) expect(result.value).toEqual([])
    })

    it('should return unique cwds as projects sorted by lastModified descending', async () => {
      const mockFs = new MockFilesystemService()
      const orgDir = srcOrgDir('work')
      addOrgDir(mockFs, 'work')

      mockFs.addFile(
        `${orgDir}/local_aaa.json`,
        JSON.stringify({ sessionId: 'local_aaa', cwd: '/Users/longnguyen/alpha', title: 'Alpha session' }),
      )
      mockFs.setMtime(`${orgDir}/local_aaa.json`, new Date('2026-06-01'))

      mockFs.addFile(
        `${orgDir}/local_bbb.json`,
        JSON.stringify({ sessionId: 'local_bbb', cwd: '/Users/longnguyen/hotel', title: 'Hotel session' }),
      )
      mockFs.setMtime(`${orgDir}/local_bbb.json`, new Date('2026-06-29'))

      // Second session for same cwd as alpha (older, should not affect project date)
      mockFs.addFile(
        `${orgDir}/local_ccc.json`,
        JSON.stringify({ sessionId: 'local_ccc', cwd: '/Users/longnguyen/alpha', title: 'Alpha session 2' }),
      )
      mockFs.setMtime(`${orgDir}/local_ccc.json`, new Date('2026-05-15'))

      const svc = new SessionSyncService(makeRepo([source]), mockFs)
      const result = await svc.listProjects(SOURCE_ID)

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value).toHaveLength(2)
        // hotel is newer, should be first
        expect(result.value[0]?.id).toBe('/Users/longnguyen/hotel')
        expect(result.value[0]?.name).toBe('longnguyen/hotel')
        expect(result.value[1]?.id).toBe('/Users/longnguyen/alpha')
        expect(result.value[1]?.name).toBe('longnguyen/alpha')
      }
    })

    it('should skip session files without cwd', async () => {
      const mockFs = new MockFilesystemService()
      const orgDir = srcOrgDir('work')
      addOrgDir(mockFs, 'work')

      mockFs.addFile(
        `${orgDir}/local_aaa.json`,
        JSON.stringify({ sessionId: 'local_aaa' }), // no cwd
      )

      const svc = new SessionSyncService(makeRepo([source]), mockFs)
      const result = await svc.listProjects(SOURCE_ID)

      expect(result.ok).toBe(true)
      if (result.ok) expect(result.value).toHaveLength(0)
    })
  })

  describe('listSessionFiles', () => {
    it('should return empty array when source profile not found', async () => {
      const mockFs = new MockFilesystemService()
      const svc = new SessionSyncService(makeRepo([]), mockFs)

      const result = await svc.listSessionFiles(SOURCE_ID, '/some/cwd')

      expect(result.ok).toBe(true)
      if (result.ok) expect(result.value).toEqual([])
    })

    it('should return only sessions matching the given cwd', async () => {
      const mockFs = new MockFilesystemService()
      const orgDir = srcOrgDir('work')
      addOrgDir(mockFs, 'work')

      mockFs.addFile(
        `${orgDir}/local_aaa.json`,
        JSON.stringify({ sessionId: 'local_aaa', cwd: '/Users/longnguyen/hotel', title: 'Session A' }),
      )
      mockFs.setMtime(`${orgDir}/local_aaa.json`, new Date('2026-06-28'))

      mockFs.addFile(
        `${orgDir}/local_bbb.json`,
        JSON.stringify({ sessionId: 'local_bbb', cwd: '/Users/longnguyen/alpha', title: 'Other project' }),
      )

      mockFs.addFile(
        `${orgDir}/local_ccc.json`,
        JSON.stringify({ sessionId: 'local_ccc', cwd: '/Users/longnguyen/hotel', title: 'Session C' }),
      )
      mockFs.setMtime(`${orgDir}/local_ccc.json`, new Date('2026-06-29'))

      const svc = new SessionSyncService(makeRepo([source]), mockFs)
      const result = await svc.listSessionFiles(SOURCE_ID, '/Users/longnguyen/hotel')

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value).toHaveLength(2)
        // newest first
        expect(result.value[0]?.name).toBe('Session C')
        expect(result.value[1]?.name).toBe('Session A')
        // id is the full file path
        expect(result.value[0]?.id).toContain('local_ccc.json')
      }
    })
  })

  describe('syncSessions', () => {
    it('should return synced 0 when source profile not found', async () => {
      const mockFs = new MockFilesystemService()
      const svc = new SessionSyncService(makeRepo([target]), mockFs)

      const result = await svc.syncSessions({
        sourceProfileId: SOURCE_ID,
        sessionFiles: [{ projectId: '/some/cwd', sessionId: '/profiles/work/user-data/claude-code-sessions/acc/org/local_aaa.json' }],
        targetProfileIds: [TARGET_ID],
      })

      expect(result.ok).toBe(true)
      if (result.ok) expect(result.value.synced).toBe(0)
    })

    it('should copy session file to target profile org dir', async () => {
      const mockFs = new MockFilesystemService()

      // Source session file
      const srcFile = `${srcOrgDir('work')}/local_aaa.json`
      addOrgDir(mockFs, 'work')
      mockFs.addFile(srcFile, JSON.stringify({ sessionId: 'local_aaa', cwd: '/Users/longnguyen/hotel' }))

      // Target has an existing org dir (all levels)
      const targetBase = `/profiles/personal/user-data/claude-code-sessions`
      const targetOrgDir = `${targetBase}/${TARGET_ACCOUNT_ID}/${TARGET_ORG_ID}`
      mockFs.addDirectory(targetBase)
      mockFs.addDirectory(`${targetBase}/${TARGET_ACCOUNT_ID}`)
      mockFs.addDirectory(targetOrgDir)

      const svc = new SessionSyncService(makeRepo([source, target]), mockFs)
      const result = await svc.syncSessions({
        sourceProfileId: SOURCE_ID,
        sessionFiles: [{ projectId: '/Users/longnguyen/hotel', sessionId: srcFile }],
        targetProfileIds: [TARGET_ID],
      })

      expect(result.ok).toBe(true)
      if (result.ok) expect(result.value.synced).toBe(1)

      const destFile = `${targetOrgDir}/local_aaa.json`
      expect(await mockFs.exists(destFile)).toBe(true)
    })

    it('should skip files that already exist in target', async () => {
      const mockFs = new MockFilesystemService()

      const srcFile = `${srcOrgDir('work')}/local_aaa.json`
      addOrgDir(mockFs, 'work')
      mockFs.addFile(srcFile, JSON.stringify({ sessionId: 'local_aaa', cwd: '/Users/longnguyen/hotel' }))

      const targetBase = `/profiles/personal/user-data/claude-code-sessions`
      const targetOrgDir = `${targetBase}/${TARGET_ACCOUNT_ID}/${TARGET_ORG_ID}`
      mockFs.addDirectory(targetBase)
      mockFs.addDirectory(`${targetBase}/${TARGET_ACCOUNT_ID}`)
      mockFs.addDirectory(targetOrgDir)
      // File already exists in target
      mockFs.addFile(`${targetOrgDir}/local_aaa.json`, '{}')

      const svc = new SessionSyncService(makeRepo([source, target]), mockFs)
      const result = await svc.syncSessions({
        sourceProfileId: SOURCE_ID,
        sessionFiles: [{ projectId: '/Users/longnguyen/hotel', sessionId: srcFile }],
        targetProfileIds: [TARGET_ID],
      })

      expect(result.ok).toBe(true)
      if (result.ok) expect(result.value.synced).toBe(0)
    })

    it('should skip target profiles that do not exist in repo', async () => {
      const GHOST_ID = createProfileId('99999999-9999-9999-9999-999999999999')
      const mockFs = new MockFilesystemService()

      const svc = new SessionSyncService(makeRepo([source]), mockFs)
      const result = await svc.syncSessions({
        sourceProfileId: SOURCE_ID,
        sessionFiles: [{ projectId: '/some/cwd', sessionId: '/some/file.json' }],
        targetProfileIds: [GHOST_ID],
      })

      expect(result.ok).toBe(true)
      if (result.ok) expect(result.value.synced).toBe(0)
    })

    it('should skip target profile when it has no org dir yet', async () => {
      const mockFs = new MockFilesystemService()
      // Target sessions base exists but no account dirs
      mockFs.addDirectory(`/profiles/personal/user-data/claude-code-sessions`)

      const srcFile = `${srcOrgDir('work')}/local_aaa.json`
      mockFs.addFile(srcFile, '{}')

      const svc = new SessionSyncService(makeRepo([source, target]), mockFs)
      const result = await svc.syncSessions({
        sourceProfileId: SOURCE_ID,
        sessionFiles: [{ projectId: '/some/cwd', sessionId: srcFile }],
        targetProfileIds: [TARGET_ID],
      })

      expect(result.ok).toBe(true)
      if (result.ok) expect(result.value.synced).toBe(0)
    })
  })
})
