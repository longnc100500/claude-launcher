import { spawnSync } from 'child_process'
import type { IpcMain } from 'electron'
import { IPC_CHANNELS } from '../../shared/ipc/channels'
import { LaunchInputSchema, ProfileIdParamsSchema } from '../../shared/ipc/schemas'
import { ProfileValidationError } from '../../domain/errors'
import { Ok, Err } from '../../shared/types/result'
import type { LaunchService } from '../../services/launchService'
import type { ISettingsRepository } from '../../domain/settings'
import { createProfileId } from '../../domain/profile'
import { rebuildTrayMenu } from '../tray'

export function registerLaunchHandlers(
  ipcMain: IpcMain,
  launchService: LaunchService,
  settingsRepo: ISettingsRepository,
): void {
  ipcMain.handle(IPC_CHANNELS.LAUNCHER_START, async (_event, rawInput: unknown) => {
    const parsed = LaunchInputSchema.safeParse(rawInput)
    if (!parsed.success) {
      return Err(new ProfileValidationError(parsed.error.message))
    }

    const settings = await settingsRepo.get()
    if (!settings.claudeBinaryPath) {
      return Err(new ProfileValidationError('Claude Desktop binary path is not configured'))
    }

    const result = await launchService.launch(createProfileId(parsed.data.profileId), {
      claudeBinaryPath: settings.claudeBinaryPath,
    })

    if (result.ok) void rebuildTrayMenu()

    return result
  })

  ipcMain.handle(IPC_CHANNELS.LAUNCHER_STOP, (_event, rawInput: unknown) => {
    const parsed = ProfileIdParamsSchema.safeParse(rawInput)
    if (!parsed.success) {
      return Err(new ProfileValidationError(parsed.error.message))
    }
    return launchService.stop(createProfileId(parsed.data.id))
  })

  ipcMain.handle(IPC_CHANNELS.LAUNCHER_STATUS, (_event, rawInput: unknown) => {
    const parsed = ProfileIdParamsSchema.safeParse(rawInput)
    if (!parsed.success) {
      return Err(new ProfileValidationError(parsed.error.message))
    }
    const status = launchService.getStatus(createProfileId(parsed.data.id))
    return Ok(status)
  })

  ipcMain.handle(IPC_CHANNELS.LAUNCHER_FOCUS, (_event, rawInput: unknown) => {
    const parsed = ProfileIdParamsSchema.safeParse(rawInput)
    if (!parsed.success) {
      return Err(new ProfileValidationError(parsed.error.message))
    }
    const status = launchService.getStatus(createProfileId(parsed.data.id))
    if (status.status !== 'running') {
      return Err(new ProfileValidationError('Profile is not running'))
    }
    if (process.platform === 'darwin') {
      spawnSync('osascript', [
        '-e',
        `tell application "System Events" to set frontmost of (first process whose unix id is ${status.pid}) to true`,
      ])
    }
    return Ok(undefined)
  })
}
