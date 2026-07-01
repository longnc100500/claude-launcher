import { spawn } from 'child_process';
import type { IpcMain } from 'electron';
import { ProfileValidationError } from '../../domain/errors';
import { createProfileId } from '../../domain/profile';
import type { ISettingsRepository } from '../../domain/settings';
import type { LaunchService } from '../../services/launchService';
import { IPC_CHANNELS } from '../../shared/ipc/channels';
import { LaunchInputSchema, ProfileIdParamsSchema } from '../../shared/ipc/schemas';
import { Err, Ok } from '../../shared/types/result';
import { rebuildTrayMenu } from '../tray';

export function registerLaunchHandlers(
  ipcMain: IpcMain,
  launchService: LaunchService,
  settingsRepo: ISettingsRepository,
): void {
  ipcMain.handle(IPC_CHANNELS.LAUNCHER_START, async (_event, rawInput: unknown) => {
    const parsed = LaunchInputSchema.safeParse(rawInput);
    if (!parsed.success) {
      return Err(new ProfileValidationError(parsed.error.message));
    }

    const profileId = createProfileId(parsed.data.profileId);

    // If already running, focus instead of launching
    const currentStatus = launchService.getStatus(profileId);
    if (currentStatus.status === 'running') {
      if (process.platform === 'darwin') {
        // spawn (not spawnSync): this makes an Apple Event call to System
        // Events, which can block on a macOS Automation permission prompt.
        // spawnSync would freeze the whole main process while waiting.
        spawn('osascript', [
          '-e',
          `tell application "System Events" to set frontmost of (first process whose unix id is ${currentStatus.pid}) to true`,
        ]);
      }
      return Ok({ profileId, pid: currentStatus.pid, startedAt: new Date() });
    }

    const settings = await settingsRepo.get();
    if (!settings.claudeBinaryPath) {
      return Err(new ProfileValidationError('Claude Desktop binary path is not configured'));
    }

    const result = await launchService.launch(profileId, {
      claudeBinaryPath: settings.claudeBinaryPath,
    });

    if (result.ok) void rebuildTrayMenu();

    return result;
  });

  ipcMain.handle(IPC_CHANNELS.LAUNCHER_STOP, (_event, rawInput: unknown) => {
    const parsed = ProfileIdParamsSchema.safeParse(rawInput);
    if (!parsed.success) {
      return Err(new ProfileValidationError(parsed.error.message));
    }
    return launchService.stop(createProfileId(parsed.data.id));
  });

  ipcMain.handle(IPC_CHANNELS.LAUNCHER_STATUS, (_event, rawInput: unknown) => {
    const parsed = ProfileIdParamsSchema.safeParse(rawInput);
    if (!parsed.success) {
      return Err(new ProfileValidationError(parsed.error.message));
    }
    const status = launchService.getStatus(createProfileId(parsed.data.id));
    return Ok(status);
  });

  ipcMain.handle(IPC_CHANNELS.LAUNCHER_FOCUS, (_event, rawInput: unknown) => {
    const parsed = ProfileIdParamsSchema.safeParse(rawInput);
    if (!parsed.success) {
      return Err(new ProfileValidationError(parsed.error.message));
    }
    const status = launchService.getStatus(createProfileId(parsed.data.id));
    if (status.status !== 'running') {
      return Err(new ProfileValidationError('Profile is not running'));
    }
    if (process.platform === 'darwin') {
      spawn('osascript', [
        '-e',
        `tell application "System Events" to set frontmost of (first process whose unix id is ${status.pid}) to true`,
      ]);
    }
    return Ok(undefined);
  });
}
