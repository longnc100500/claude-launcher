import type { ProfileId } from './profile'

export type LaunchStatus =
  | { readonly status: 'stopped' }
  | { readonly status: 'starting'; readonly profileId: ProfileId }
  | { readonly status: 'running'; readonly profileId: ProfileId; readonly pid: number }
  | { readonly status: 'stopping'; readonly profileId: ProfileId }
  | { readonly status: 'crashed'; readonly profileId: ProfileId; readonly exitCode: number | null }

export interface RunningProcess {
  readonly profileId: ProfileId
  readonly pid: number
  readonly startedAt: Date
}

export type LaunchResult =
  | { readonly ok: true; readonly process: RunningProcess }
  | { readonly ok: false; readonly error: Error }
