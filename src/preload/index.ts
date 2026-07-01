import { contextBridge, ipcRenderer } from 'electron'
import { IPC_CHANNELS } from '../shared/ipc/channels'
import type { ProfileId, CreateProfileInput, UpdateProfileInput } from '../domain/profile'
import type { AppSettings } from '../domain/settings'
import type { ClaudeApi } from '../shared/types/window-api'

const profilesApi: ClaudeApi['profiles'] = {
  list: () =>
    ipcRenderer.invoke(IPC_CHANNELS.PROFILES_LIST),

  get: (id: ProfileId) =>
    ipcRenderer.invoke(IPC_CHANNELS.PROFILES_GET, { id }),

  create: (input: CreateProfileInput) =>
    ipcRenderer.invoke(IPC_CHANNELS.PROFILES_CREATE, input),

  update: (id: ProfileId, updates: UpdateProfileInput) =>
    ipcRenderer.invoke(IPC_CHANNELS.PROFILES_UPDATE, { id, updates }),

  delete: (id: ProfileId) =>
    ipcRenderer.invoke(IPC_CHANNELS.PROFILES_DELETE, { id }),

}

const launcherApi: ClaudeApi['launcher'] = {
  start: (profileId: ProfileId) =>
    ipcRenderer.invoke(IPC_CHANNELS.LAUNCHER_START, { profileId }),

  stop: (profileId: ProfileId) =>
    ipcRenderer.invoke(IPC_CHANNELS.LAUNCHER_STOP, { id: profileId }),

  status: (profileId: ProfileId) =>
    ipcRenderer.invoke(IPC_CHANNELS.LAUNCHER_STATUS, { id: profileId }),

  focus: (profileId: ProfileId) =>
    ipcRenderer.invoke(IPC_CHANNELS.LAUNCHER_FOCUS, { id: profileId }),

  onStatusChanged: (callback: (data: { profileId: string; status: string }) => void): (() => void) => {
    const handler = (_event: Electron.IpcRendererEvent, data: { profileId: string; status: string }): void => {
      callback(data)
    }
    ipcRenderer.on(IPC_CHANNELS.LAUNCHER_STATUS_CHANGED, handler)
    return () => ipcRenderer.removeListener(IPC_CHANNELS.LAUNCHER_STATUS_CHANGED, handler)
  },
}

const settingsApi: ClaudeApi['settings'] = {
  get: () =>
    ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_GET),

  save: (settings: AppSettings) =>
    ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_SAVE, settings),
}

const sessionsApi: ClaudeApi['sessions'] = {
  listProjects: (sourceProfileId: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.SESSIONS_LIST_PROJECTS, { sourceProfileId }),

  listSessionFiles: (sourceProfileId: string, projectId: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.SESSIONS_LIST_FILES, { sourceProfileId, projectId }),

  sync: (
    sourceProfileId: string,
    sessionFiles: Array<{ projectId: string; sessionId: string }>,
    targetProfileIds: string[],
  ) =>
    ipcRenderer.invoke(IPC_CHANNELS.SESSIONS_SYNC, { sourceProfileId, sessionFiles, targetProfileIds }),
}

export type { ClaudeApi }

contextBridge.exposeInMainWorld('claudeApi', {
  profiles: profilesApi,
  launcher: launcherApi,
  settings: settingsApi,
  sessions: sessionsApi,
})
