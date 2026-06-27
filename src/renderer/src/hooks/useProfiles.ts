import { useState, useEffect, useCallback } from 'react'
import type { Profile } from '../../../domain/profile'

export interface UseProfilesResult {
  profiles: ReadonlyArray<Profile>
  isLoading: boolean
  error: string | null
  refresh: () => void
}

export function useProfiles(): UseProfilesResult {
  const [profiles, setProfiles] = useState<ReadonlyArray<Profile>>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(() => {
    setIsLoading(true)
    setError(null)
    window.claudeApi.profiles.list()
      .then((result) => {
        if (result.ok) {
          setProfiles(result.value)
        } else {
          setError(result.error.message)
        }
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Unknown error')
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { profiles, isLoading, error, refresh }
}
