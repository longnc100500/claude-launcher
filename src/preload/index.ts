import { contextBridge } from 'electron'

// Stub — will be replaced with full typed API in PR-10
contextBridge.exposeInMainWorld('claudeApi', {
  version: '0.0.1',
})
