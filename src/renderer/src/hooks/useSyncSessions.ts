import { useState, useCallback } from 'react'
import type { ClaudeProject, ClaudeSessionFile } from '../../../domain/session'

export interface SessionFileRef {
  projectId: string
  sessionId: string
}

export interface UseSyncSessionsReturn {
  listProjects: (sourceProfileId: string) => Promise<ClaudeProject[]>
  listSessionFiles: (sourceProfileId: string, projectId: string) => Promise<ClaudeSessionFile[]>
  syncSessions: (sourceProfileId: string, sessionFiles: SessionFileRef[], targetProfileIds: string[]) => Promise<boolean>
  isLoadingProjects: boolean
  isLoadingFiles: boolean
  isSyncing: boolean
  error: string | null
  reset: () => void
}

export function useSyncSessions(): UseSyncSessionsReturn {
  const [isLoadingProjects, setIsLoadingProjects] = useState(false)
  const [isLoadingFiles, setIsLoadingFiles] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reset = useCallback(() => setError(null), [])

  const listProjects = useCallback(async (sourceProfileId: string): Promise<ClaudeProject[]> => {
    setIsLoadingProjects(true)
    setError(null)
    try {
      const result = await window.claudeApi.sessions.listProjects(sourceProfileId)
      if (!result.ok) { setError(result.error.message); return [] }
      return [...result.value]
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      return []
    } finally {
      setIsLoadingProjects(false)
    }
  }, [])

  const listSessionFiles = useCallback(async (sourceProfileId: string, projectId: string): Promise<ClaudeSessionFile[]> => {
    setIsLoadingFiles(true)
    setError(null)
    try {
      const result = await window.claudeApi.sessions.listSessionFiles(sourceProfileId, projectId)
      if (!result.ok) { setError(result.error.message); return [] }
      return [...result.value]
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      return []
    } finally {
      setIsLoadingFiles(false)
    }
  }, [])

  const syncSessions = useCallback(
    async (sourceProfileId: string, sessionFiles: SessionFileRef[], targetProfileIds: string[]): Promise<boolean> => {
      setIsSyncing(true)
      setError(null)
      try {
        const result = await window.claudeApi.sessions.sync(sourceProfileId, sessionFiles, targetProfileIds)
        if (!result.ok) { setError(result.error.message); return false }
        return true
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
        return false
      } finally {
        setIsSyncing(false)
      }
    },
    [],
  )

  return { listProjects, listSessionFiles, syncSessions, isLoadingProjects, isLoadingFiles, isSyncing, error, reset }
}
