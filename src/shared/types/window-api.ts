import type { Profile, ProfileId, CreateProfileInput, UpdateProfileInput } from '../../domain/profile'
import type { AppSettings } from '../../domain/settings'
import type { RunningProcess, LaunchStatus } from '../../domain/launch'
import type { SyncResult, ClaudeProject, ClaudeSessionFile } from '../../domain/session'
import type { Result } from './result'

export type ProfilesApi = {
  list: () => Promise<Result<ReadonlyArray<Profile>>>
  get: (id: ProfileId) => Promise<Result<Profile>>
  create: (input: CreateProfileInput) => Promise<Result<Profile>>
  update: (id: ProfileId, updates: UpdateProfileInput) => Promise<Result<Profile>>
  delete: (id: ProfileId) => Promise<Result<void>>
}

export type LauncherApi = {
  start: (profileId: ProfileId) => Promise<Result<RunningProcess>>
  stop: (profileId: ProfileId) => Promise<Result<void>>
  status: (profileId: ProfileId) => Promise<Result<LaunchStatus>>
  focus: (profileId: ProfileId) => Promise<Result<void>>
  onStatusChanged: (callback: (data: { profileId: string; status: string }) => void) => () => void
}

export type SettingsApi = {
  get: () => Promise<Result<AppSettings>>
  save: (settings: AppSettings) => Promise<Result<void>>
}

export type SessionsApi = {
  listProjects: (sourceProfileId: string) => Promise<Result<ReadonlyArray<ClaudeProject>>>
  listSessionFiles: (sourceProfileId: string, projectId: string) => Promise<Result<ReadonlyArray<ClaudeSessionFile>>>
  sync: (
    sourceProfileId: string,
    sessionFiles: Array<{ projectId: string; sessionId: string }>,
    targetProfileIds: string[],
  ) => Promise<Result<SyncResult>>
}

export type ClaudeApi = {
  profiles: ProfilesApi
  launcher: LauncherApi
  settings: SettingsApi
  sessions: SessionsApi
}
