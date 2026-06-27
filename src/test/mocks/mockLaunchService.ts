import type { ProfileId } from '../../domain/profile'
import type { RunningProcess, LaunchStatus } from '../../domain/launch'
import type { LaunchError } from '../../domain/errors'
import { ProfileNotFoundError } from '../../domain/errors'
import type { Result } from '../../shared/types/result'
import { Ok, Err } from '../../shared/types/result'
import type { LaunchServiceConfig } from '../../services/launchService'

export class MockLaunchService {
  private readonly running = new Map<string, RunningProcess>()

  async launch(
    profileId: ProfileId,
    _config: LaunchServiceConfig,
  ): Promise<Result<RunningProcess, LaunchError>> {
    const proc: RunningProcess = {
      profileId,
      pid: 99999,
      startedAt: new Date(),
    }
    this.running.set(profileId, proc)
    return Ok(proc)
  }

  stop(profileId: ProfileId): Result<void, ProfileNotFoundError> {
    if (!this.running.has(profileId)) {
      return Err(new ProfileNotFoundError(profileId))
    }
    this.running.delete(profileId)
    return Ok(undefined)
  }

  getStatus(profileId: ProfileId): LaunchStatus {
    const proc = this.running.get(profileId)
    if (proc === undefined) return { status: 'stopped' }
    return { status: 'running', profileId, pid: proc.pid }
  }

  getAllStatuses(): ReadonlyMap<string, LaunchStatus> {
    const statuses = new Map<string, LaunchStatus>()
    for (const [id, proc] of this.running) {
      statuses.set(id, { status: 'running', profileId: id as never, pid: proc.pid })
    }
    return statuses
  }
}
