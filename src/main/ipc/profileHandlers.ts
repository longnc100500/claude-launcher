import type { IpcMain } from 'electron'
import { IPC_CHANNELS } from '../../shared/ipc/channels'
import {
  CreateProfileInputSchema,
  UpdateProfileInputSchema,
  ProfileIdParamsSchema,
} from '../../shared/ipc/schemas'
import { ProfileValidationError } from '../../domain/errors'
import { Err } from '../../shared/types/result'
import type { ProfileService } from '../../services/profileService'

export function registerProfileHandlers(
  ipcMain: IpcMain,
  profileService: ProfileService,
): void {
  ipcMain.handle(IPC_CHANNELS.PROFILES_LIST, async () => {
    return profileService.listProfiles()
  })

  ipcMain.handle(IPC_CHANNELS.PROFILES_GET, async (_event, rawInput: unknown) => {
    const parsed = ProfileIdParamsSchema.safeParse(rawInput)
    if (!parsed.success) {
      return Err(new ProfileValidationError(parsed.error.message))
    }
    return profileService.getProfile(parsed.data.id as never)
  })

  ipcMain.handle(IPC_CHANNELS.PROFILES_CREATE, async (_event, rawInput: unknown) => {
    const parsed = CreateProfileInputSchema.safeParse(rawInput)
    if (!parsed.success) {
      return Err(new ProfileValidationError(parsed.error.message))
    }
    return profileService.createProfile(parsed.data)
  })

  ipcMain.handle(IPC_CHANNELS.PROFILES_UPDATE, async (_event, rawInput: unknown) => {
    const bodySchema = ProfileIdParamsSchema.extend({
      updates: UpdateProfileInputSchema,
    })
    const parsed = bodySchema.safeParse(rawInput)
    if (!parsed.success) {
      return Err(new ProfileValidationError(parsed.error.message))
    }
    return profileService.updateProfile(parsed.data.id as never, parsed.data.updates)
  })

  ipcMain.handle(IPC_CHANNELS.PROFILES_DELETE, async (_event, rawInput: unknown) => {
    const parsed = ProfileIdParamsSchema.safeParse(rawInput)
    if (!parsed.success) {
      return Err(new ProfileValidationError(parsed.error.message))
    }
    return profileService.deleteProfile(parsed.data.id as never)
  })
}
