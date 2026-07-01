import type { IProfileRepository, ProfileId } from '../domain/profile'
import type { IFilesystemService } from '../domain/filesystem'
import type {
  SyncSessionsInput,
  SyncResult,
  SyncError,
  ClaudeProject,
  ClaudeSessionFile,
  ListProjectsError,
  ListSessionFilesError,
} from '../domain/session'
import { Ok } from '../shared/types/result'
import type { Result } from '../shared/types/result'

// Claude Desktop stores sessions at:
//   <userData>/claude-code-sessions/<accountId>/<orgId>/local_<sessionId>.json
// Two-level directory hierarchy, then flat local_*.json files.
// When syncing, we copy files into the target profile's first <accountId>/<orgId> dir.

const SESSIONS_DIR = 'claude-code-sessions'
const LOCAL_PREFIX = 'local_'

function projectNameFromCwd(cwd: string): string {
  const parts = cwd.split('/').filter(Boolean)
  if (parts.length >= 2) return `${parts[parts.length - 2]}/${parts[parts.length - 1]}`
  return parts[parts.length - 1] ?? cwd
}

interface SessionFileData {
  sessionId: string
  cwd?: string
  title?: string
  lastActivityAt?: string
  createdAt?: string
}

export class SessionSyncService {
  constructor(
    private readonly repo: IProfileRepository,
    private readonly fs: IFilesystemService,
  ) {}

  /**
   * Returns one "project" per unique cwd found across all sessions in the profile.
   */
  async listProjects(
    sourceProfileId: ProfileId,
  ): Promise<Result<ReadonlyArray<ClaudeProject>, ListProjectsError>> {
    const sourceProfile = await this.repo.findById(sourceProfileId)
    if (!sourceProfile) return Ok([])

    const sessionsBase = `${sourceProfile.homeDir}/user-data/${SESSIONS_DIR}`
    if (!(await this.fs.exists(sessionsBase))) return Ok([])

    const allFiles = await this._listAllSessionFiles(sessionsBase)
    // Group by cwd
    const cwdMap = new Map<string, { lastModified: Date }>()
    for (const { data, lastModified } of allFiles) {
      if (!data.cwd) continue
      const existing = cwdMap.get(data.cwd)
      if (!existing || lastModified > existing.lastModified) {
        cwdMap.set(data.cwd, { lastModified })
      }
    }

    const projects: ClaudeProject[] = []
    for (const [cwd, { lastModified }] of cwdMap) {
      projects.push({ id: cwd, name: projectNameFromCwd(cwd), lastModified })
    }
    projects.sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime())
    return Ok(projects)
  }

  /**
   * Returns all session files for a given cwd (project).
   */
  async listSessionFiles(
    sourceProfileId: ProfileId,
    projectCwd: string,
  ): Promise<Result<ReadonlyArray<ClaudeSessionFile>, ListSessionFilesError>> {
    const sourceProfile = await this.repo.findById(sourceProfileId)
    if (!sourceProfile) return Ok([])

    const sessionsBase = `${sourceProfile.homeDir}/user-data/${SESSIONS_DIR}`
    if (!(await this.fs.exists(sessionsBase))) return Ok([])

    const allFiles = await this._listAllSessionFiles(sessionsBase)
    const sessions: ClaudeSessionFile[] = []
    for (const { data, lastModified, filePath } of allFiles) {
      if (data.cwd !== projectCwd) continue
      if (!data.sessionId) continue
      const name = data.title ?? projectNameFromCwd(data.cwd ?? '')
      sessions.push({ id: filePath, name, projectId: projectCwd, lastModified })
    }
    sessions.sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime())
    return Ok(sessions)
  }

  async syncSessions(input: SyncSessionsInput): Promise<Result<SyncResult, SyncError>> {
    const sourceProfile = await this.repo.findById(input.sourceProfileId)
    if (!sourceProfile) return Ok({ synced: 0 })

    let synced = 0

    for (const targetId of input.targetProfileIds) {
      const target = await this.repo.findById(targetId)
      if (!target) continue

      // Find the target profile's <accountId>/<orgId> destination directory.
      const targetBase = `${target.homeDir}/user-data/${SESSIONS_DIR}`
      const targetOrgDir = await this._findOrCreateOrgDir(targetBase)
      if (!targetOrgDir) continue

      await this.fs.mkdir(targetOrgDir, { recursive: true })

      for (const { sessionId: filePath } of input.sessionFiles) {
        // filePath is the absolute path of the source session file
        const fileName = filePath.split('/').pop()
        if (!fileName) continue
        const dest = `${targetOrgDir}/${fileName}`
        // Skip if already exists
        if (await this.fs.exists(dest)) continue
        await this.fs.copyFile(filePath, dest)
        synced++
      }
    }

    return Ok({ synced })
  }

  // ── private helpers ─────────────────────────────────────────────────────────

  /**
   * Walk <sessionsBase>/<accountId>/<orgId>/local_*.json and return parsed data.
   */
  private async _listAllSessionFiles(
    sessionsBase: string,
  ): Promise<Array<{ data: SessionFileData; lastModified: Date; filePath: string }>> {
    const results: Array<{ data: SessionFileData; lastModified: Date; filePath: string }> = []

    let accountDirs: string[]
    try {
      accountDirs = (await this.fs.readdir(sessionsBase)).filter((e) => !e.startsWith('.'))
    } catch {
      return results
    }

    for (const accountId of accountDirs) {
      const accountDir = `${sessionsBase}/${accountId}`
      let orgDirs: string[]
      try {
        orgDirs = (await this.fs.readdir(accountDir)).filter((e) => !e.startsWith('.'))
      } catch {
        continue
      }

      for (const orgId of orgDirs) {
        const orgDir = `${accountDir}/${orgId}`
        let files: string[]
        try {
          files = (await this.fs.readdir(orgDir)).filter(
            (f) => !f.startsWith('.') && f.startsWith(LOCAL_PREFIX) && f.endsWith('.json'),
          )
        } catch {
          continue
        }

        for (const file of files) {
          const filePath = `${orgDir}/${file}`
          try {
            const raw = await this.fs.readFile(filePath)
            const data = JSON.parse(raw) as SessionFileData
            const lastModified = await this.fs.statMtime(filePath)
            results.push({ data, lastModified, filePath })
          } catch {
            // skip unreadable files
          }
        }
      }
    }

    return results
  }

  /**
   * Returns the first <accountId>/<orgId> dir in the target, or null if none exists.
   * If multiple exist, picks the most recently modified.
   */
  private async _findOrCreateOrgDir(sessionsBase: string): Promise<string | null> {
    let accountDirs: string[]
    try {
      accountDirs = (await this.fs.readdir(sessionsBase)).filter((e) => !e.startsWith('.'))
    } catch {
      return null
    }

    for (const accountId of accountDirs) {
      const accountDir = `${sessionsBase}/${accountId}`
      let orgDirs: string[]
      try {
        orgDirs = (await this.fs.readdir(accountDir)).filter((e) => !e.startsWith('.'))
      } catch {
        continue
      }
      if (orgDirs.length > 0) {
        return `${accountDir}/${orgDirs[0]}`
      }
    }

    return null
  }
}
