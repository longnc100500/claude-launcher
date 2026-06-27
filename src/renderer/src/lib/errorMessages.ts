const ERROR_MESSAGES: Readonly<Record<string, string>> = {
  PROFILE_NOT_FOUND: 'Profile not found. It may have been deleted.',
  PROFILE_ALREADY_EXISTS: 'A profile with this name already exists.',
  PROFILE_VALIDATION_ERROR: 'Invalid profile data.',
  BINARY_NOT_FOUND: 'Claude Desktop not found. Please set the binary path in Settings.',
  PROCESS_ALREADY_RUNNING: 'This profile is already running.',
  PROCESS_START_FAILED: 'Failed to start Claude Desktop.',
  STORAGE_ERROR: 'Failed to save data. Check available disk space.',
}

export function getUserFriendlyError(errorCode: string, fallback?: string): string {
  return ERROR_MESSAGES[errorCode] ?? fallback ?? 'An unexpected error occurred.'
}
