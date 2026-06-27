import type { IpcMain } from 'electron'
import { IPC_CHANNELS } from '../../shared/ipc/channels'
import { AppSettingsSchema } from '../../shared/ipc/schemas'
import { ProfileValidationError } from '../../domain/errors'
import { Err, Ok } from '../../shared/types/result'
import type { ISettingsRepository } from '../../domain/settings'

export function registerSettingsHandlers(
  ipcMain: IpcMain,
  settingsRepo: ISettingsRepository,
): void {
  ipcMain.handle(IPC_CHANNELS.SETTINGS_GET, async () => {
    const settings = await settingsRepo.get()
    return Ok(settings)
  })

  ipcMain.handle(IPC_CHANNELS.SETTINGS_SAVE, async (_event, rawInput: unknown) => {
    const parsed = AppSettingsSchema.safeParse(rawInput)
    if (!parsed.success) {
      return Err(new ProfileValidationError(parsed.error.message))
    }
    await settingsRepo.save(parsed.data)
    return Ok(undefined)
  })
}
