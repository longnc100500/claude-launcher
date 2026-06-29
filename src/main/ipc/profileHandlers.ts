import type { IpcMain } from 'electron'
import { IPC_CHANNELS } from '../../shared/ipc/channels'
import {
  CreateProfileInputSchema,
  UpdateProfileInputSchema,
  ProfileIdParamsSchema,
} from '../../shared/ipc/schemas'
import { ProfileValidationError, ProfileRunningError } from '../../domain/errors'
import { Ok, Err } from '../../shared/types/result'
import type { ProfileService } from '../../services/profileService'
import type { IFilesystemService } from '../../domain/filesystem'
import type { LaunchService } from '../../services/launchService'
import { createProfileId } from '../../domain/profile'

export function registerProfileHandlers(
  ipcMain: IpcMain,
  profileService: ProfileService,
  fs: IFilesystemService,
  launchService: LaunchService,
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

  ipcMain.handle(IPC_CHANNELS.PROFILES_DISK_USAGE, async (_event, rawInput: unknown) => {
    const parsed = ProfileIdParamsSchema.safeParse(rawInput)
    if (!parsed.success) {
      return Err(new ProfileValidationError(parsed.error.message))
    }
    const profileResult = await profileService.getProfile(createProfileId(parsed.data.id))
    if (!profileResult.ok) return profileResult
    const userDataDir = `${profileResult.value.homeDir}/user-data`
    const bytes = await fs.getDirSize(userDataDir)
    return Ok({ bytes })
  })

  ipcMain.handle(IPC_CHANNELS.PROFILES_CLEANUP, async (_event, rawInput: unknown) => {
    const parsed = ProfileIdParamsSchema.safeParse(rawInput)
    if (!parsed.success) {
      return Err(new ProfileValidationError(parsed.error.message))
    }
    const profileId = createProfileId(parsed.data.id)
    const status = launchService.getStatus(profileId)
    if (status.status === 'running') {
      return Err(new ProfileRunningError(profileId))
    }
    const profileResult = await profileService.getProfile(profileId)
    if (!profileResult.ok) return profileResult
    const userDataDir = `${profileResult.value.homeDir}/user-data`
    const cacheDirs = [
      'Cache', 'Code Cache', 'GPU Cache',
      'DawnGraphiteCache', 'DawnWebGPUCache',
      'VideoDecodeStats', 'blob_storage', 'Crashpad',
    ]
    let bytesFreed = 0
    for (const dir of cacheDirs) {
      const dirPath = `${userDataDir}/${dir}`
      const size = await fs.getDirSize(dirPath)
      await fs.rm(dirPath, { recursive: true, force: true })
      bytesFreed += size
    }
    return Ok({ bytesFreed })
  })
}
