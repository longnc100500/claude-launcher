export abstract class AppError extends Error {
  abstract readonly code: string

  constructor(message: string) {
    super(message)
    this.name = this.constructor.name
  }
}

export class ProfileNotFoundError extends AppError {
  readonly code = 'PROFILE_NOT_FOUND' as const

  constructor(public readonly profileId: string) {
    super(`Profile not found: ${profileId}`)
  }
}

export class ProfileAlreadyExistsError extends AppError {
  readonly code = 'PROFILE_ALREADY_EXISTS' as const

  constructor(public readonly name: string) {
    super(`Profile already exists: ${name}`)
  }
}

export class ProfileValidationError extends AppError {
  readonly code = 'PROFILE_VALIDATION_ERROR' as const

  constructor(public readonly reason: string) {
    super(`Profile validation failed: ${reason}`)
  }
}

export class BinaryNotFoundError extends AppError {
  readonly code = 'BINARY_NOT_FOUND' as const

  constructor(public readonly path: string) {
    super(`Claude Desktop binary not found at: ${path}`)
  }
}

export class ProcessAlreadyRunningError extends AppError {
  readonly code = 'PROCESS_ALREADY_RUNNING' as const

  constructor(public readonly profileId: string) {
    super(`Process already running for profile: ${profileId}`)
  }
}

export class ProcessStartFailedError extends AppError {
  readonly code = 'PROCESS_START_FAILED' as const

  constructor(
    public readonly profileId: string,
    public readonly reason: string,
  ) {
    super(`Failed to start process for profile ${profileId}: ${reason}`)
  }
}

export class StorageError extends AppError {
  readonly code = 'STORAGE_ERROR' as const

  constructor(public readonly reason: string) {
    super(`Storage error: ${reason}`)
  }
}

export class ProfileRunningError extends AppError {
  readonly code = 'PROFILE_RUNNING' as const

  constructor(public readonly profileId: string) {
    super(`Profile is currently running: ${profileId}`)
  }
}

export type CleanupError =
  | ProfileRunningError
  | ProfileNotFoundError
  | StorageError

export type ProfileError =
  | ProfileNotFoundError
  | ProfileAlreadyExistsError
  | ProfileValidationError

export type LaunchError =
  | BinaryNotFoundError
  | ProcessAlreadyRunningError
  | ProcessStartFailedError
  | ProfileNotFoundError
