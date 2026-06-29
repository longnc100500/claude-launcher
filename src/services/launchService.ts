import { spawn } from 'child_process'
import type { ChildProcess } from 'child_process'
import type { ProfileId } from '../domain/profile'
import type { RunningProcess, LaunchStatus } from '../domain/launch'
import {
  BinaryNotFoundError,
  ProcessAlreadyRunningError,
  ProcessStartFailedError,
  ProfileNotFoundError,
} from '../domain/errors'
import type { LaunchError } from '../domain/errors'
import type { Result } from '../shared/types/result'
import { Ok, Err } from '../shared/types/result'
import type { IFilesystemService } from '../domain/filesystem'
import type { ProfileService } from './profileService'

export interface LaunchServiceConfig {
  readonly claudeBinaryPath: string
}

export class LaunchService {
  private readonly processes = new Map<string, ChildProcess>()
  private exitListeners: Array<(profileId: ProfileId) => void> = []

  onProcessExit(listener: (profileId: ProfileId) => void): () => void {
    this.exitListeners.push(listener)
    return () => {
      this.exitListeners = this.exitListeners.filter((l) => l !== listener)
    }
  }

  constructor(
    private readonly profileService: ProfileService,
    private readonly fs: IFilesystemService,
  ) {}

  async launch(
    profileId: ProfileId,
    config: LaunchServiceConfig,
  ): Promise<Result<RunningProcess, LaunchError>> {
    // Check binary exists
    const binaryExists = await this.fs.exists(config.claudeBinaryPath)
    if (!binaryExists) {
      return Err(new BinaryNotFoundError(config.claudeBinaryPath))
    }

    // Check not already running
    if (this.processes.has(profileId)) {
      return Err(new ProcessAlreadyRunningError(profileId))
    }

    // Get profile
    const profileResult = await this.profileService.getProfile(profileId)
    if (!profileResult.ok) {
      return Err(profileResult.error)
    }
    const profile = profileResult.value

    // Spawn Claude Desktop with isolated user data dir.
    // On macOS, NSHomeDirectory() ignores the HOME env var, so Electron apps
    // store data in ~/Library/Application Support/ regardless of HOME.
    // Passing --user-data-dir forces Chromium to use a profile-specific path.
    const userDataDir = `${profile.homeDir}/user-data`
    let child: ChildProcess
    try {
      child = spawn(
        config.claudeBinaryPath,
        [`--user-data-dir=${userDataDir}`],
        { env: process.env, detached: true, stdio: 'ignore' },
      )
    } catch (err) {
      return Err(
        new ProcessStartFailedError(
          profileId,
          err instanceof Error ? err.message : String(err),
        ),
      )
    }

    if (child.pid === undefined) {
      return Err(new ProcessStartFailedError(profileId, 'Process failed to start (no PID)'))
    }

    const pid = child.pid
    this.processes.set(profileId, child)

    child.on('exit', () => {
      this.processes.delete(profileId)
      for (const listener of this.exitListeners) {
        listener(profileId)
      }
    })

    child.unref()

    // Record usage
    await this.profileService.recordProfileUsage(profileId)

    const runningProcess: RunningProcess = {
      profileId,
      pid,
      startedAt: new Date(),
    }

    return Ok(runningProcess)
  }

  stop(profileId: ProfileId): Result<void, ProfileNotFoundError> {
    const child = this.processes.get(profileId)
    if (child === undefined) {
      return Err(new ProfileNotFoundError(profileId))
    }
    child.kill('SIGTERM')
    this.processes.delete(profileId)
    return Ok(undefined)
  }

  getStatus(profileId: ProfileId): LaunchStatus {
    const child = this.processes.get(profileId)
    if (child === undefined || child.pid === undefined) {
      return { status: 'stopped' }
    }
    return { status: 'running', profileId, pid: child.pid }
  }

  getAllStatuses(): ReadonlyMap<string, LaunchStatus> {
    const statuses = new Map<string, LaunchStatus>()
    for (const [id, child] of this.processes) {
      if (child.pid !== undefined) {
        statuses.set(id, { status: 'running', profileId: id as never, pid: child.pid })
      }
    }
    return statuses
  }
}
