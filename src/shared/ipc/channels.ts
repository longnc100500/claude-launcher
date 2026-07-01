export const IPC_CHANNELS = {
  PROFILES_LIST: 'profiles:list',
  PROFILES_GET: 'profiles:get',
  PROFILES_CREATE: 'profiles:create',
  PROFILES_UPDATE: 'profiles:update',
  PROFILES_DELETE: 'profiles:delete',
  LAUNCHER_START: 'launcher:start',
  LAUNCHER_STOP: 'launcher:stop',
  LAUNCHER_STATUS: 'launcher:status',
  LAUNCHER_FOCUS: 'launcher:focus',
  SETTINGS_GET: 'settings:get',
  SETTINGS_SAVE: 'settings:save',
  LAUNCHER_STATUS_CHANGED: 'launcher:statuschanged',
  SESSIONS_LIST_PROJECTS: 'sessions:list-projects',
  SESSIONS_LIST_FILES: 'sessions:list-files',
  SESSIONS_SYNC: 'sessions:sync',
} as const

export type IpcChannel = (typeof IPC_CHANNELS)[keyof typeof IPC_CHANNELS]
