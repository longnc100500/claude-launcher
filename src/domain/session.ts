import type { ProfileId } from './profile'
import { AppError } from './errors'

export interface SyncResult {
  readonly synced: number
}

export interface ClaudeProject {
  readonly id: string           // dir name e.g. "-Users-longnguyen-my-project"
  readonly name: string         // last path segment e.g. "my-project"
  readonly lastModified: Date
}

export interface ClaudeSessionFile {
  readonly id: string           // filename e.g. "7ea54902-....jsonl"
  readonly name: string         // custom-title or first user message
  readonly projectId: string    // parent project dir name
  readonly lastModified: Date
}

export interface SyncSessionsInput {
  readonly sourceProfileId: ProfileId
  readonly sessionFiles: ReadonlyArray<{ readonly projectId: string; readonly sessionId: string }>
  readonly targetProfileIds: ReadonlyArray<ProfileId>
}

export class SessionSyncSourceNotFoundError extends AppError {
  readonly code = 'SESSION_SYNC_SOURCE_NOT_FOUND' as const
  constructor(public readonly profileId: string) {
    super(`Source profile not found: ${profileId}`)
  }
}

export class SessionSyncNoSessionsError extends AppError {
  readonly code = 'SESSION_SYNC_NO_SESSIONS' as const
  constructor(public readonly profileId: string) {
    super(`No sessions found in source profile: ${profileId}`)
  }
}

export type SyncError = SessionSyncSourceNotFoundError | SessionSyncNoSessionsError

export class SessionListSourceNotFoundError extends AppError {
  readonly code = 'SESSION_LIST_SOURCE_NOT_FOUND' as const
  constructor(public readonly profileId: string) {
    super(`Profile not found: ${profileId}`)
  }
}

export type ListProjectsError = SessionListSourceNotFoundError

export class SessionListFilesError extends AppError {
  readonly code = 'SESSION_LIST_FILES_ERROR' as const
  constructor(public readonly projectId: string) {
    super(`Cannot list sessions for project: ${projectId}`)
  }
}

export type ListSessionFilesError = SessionListFilesError
