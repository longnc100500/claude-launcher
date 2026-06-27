import { useState, useCallback } from 'react'
import type { ProfileId } from '../../../domain/profile'
import type { RunningProcess } from '../../../domain/launch'

export interface UseLaunchStatusResult {
  runningProfileIds: ReadonlySet<string>
  launch: (profileId: ProfileId) => Promise<boolean>
  stop: (profileId: ProfileId) => Promise<boolean>
  isLaunching: boolean
  error: string | null
}

export function useLaunchStatus(): UseLaunchStatusResult {
  const [runningProfileIds, setRunningProfileIds] = useState<ReadonlySet<string>>(new Set())
  const [isLaunching, setIsLaunching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const launch = useCallback(async (profileId: ProfileId): Promise<boolean> => {
    setIsLaunching(true)
    setError(null)
    try {
      const result = await window.claudeApi.launcher.start(profileId)
      if (result.ok) {
        const proc = result.value as RunningProcess
        setRunningProfileIds((prev) => new Set([...prev, proc.profileId]))
        return true
      }
      setError(result.error.message)
      return false
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      return false
    } finally {
      setIsLaunching(false)
    }
  }, [])

  const stop = useCallback(async (profileId: ProfileId): Promise<boolean> => {
    setError(null)
    try {
      const result = await window.claudeApi.launcher.stop(profileId)
      if (result.ok) {
        setRunningProfileIds((prev) => {
          const next = new Set(prev)
          next.delete(profileId)
          return next
        })
        return true
      }
      setError(result.error.message)
      return false
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      return false
    }
  }, [])

  return { runningProfileIds, launch, stop, isLaunching, error }
}
