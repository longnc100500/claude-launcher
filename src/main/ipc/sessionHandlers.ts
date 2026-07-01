import type { IpcMain } from 'electron'
import { IPC_CHANNELS } from '../../shared/ipc/channels'
import {
  SessionsListProjectsInputSchema,
  SessionsListFilesInputSchema,
  SyncSessionsInputSchema,
} from '../../shared/ipc/schemas'
import { ProfileValidationError } from '../../domain/errors'
import { Err } from '../../shared/types/result'
import type { SessionSyncService } from '../../services/sessionSyncService'
import { createProfileId } from '../../domain/profile'

export function registerSessionHandlers(
  ipcMain: IpcMain,
  sessionSyncService: SessionSyncService,
): void {
  ipcMain.handle(IPC_CHANNELS.SESSIONS_LIST_PROJECTS, async (_event, rawInput: unknown) => {
    const parsed = SessionsListProjectsInputSchema.safeParse(rawInput)
    if (!parsed.success) return Err(new ProfileValidationError(parsed.error.message))
    return sessionSyncService.listProjects(createProfileId(parsed.data.sourceProfileId))
  })

  ipcMain.handle(IPC_CHANNELS.SESSIONS_LIST_FILES, async (_event, rawInput: unknown) => {
    const parsed = SessionsListFilesInputSchema.safeParse(rawInput)
    if (!parsed.success) {
      return Err(new ProfileValidationError(parsed.error.message))
    }
    return sessionSyncService.listSessionFiles(
      createProfileId(parsed.data.sourceProfileId),
      parsed.data.projectId,
    )
  })

  ipcMain.handle(IPC_CHANNELS.SESSIONS_SYNC, async (_event, rawInput: unknown) => {
    const parsed = SyncSessionsInputSchema.safeParse(rawInput)
    if (!parsed.success) {
      return Err(new ProfileValidationError(parsed.error.message))
    }
    return sessionSyncService.syncSessions({
      sourceProfileId: createProfileId(parsed.data.sourceProfileId),
      sessionFiles: parsed.data.sessionFiles,
      targetProfileIds: parsed.data.targetProfileIds.map(createProfileId),
    })
  })
}
