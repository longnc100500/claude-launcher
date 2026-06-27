import { useState, useEffect } from 'react'
import type { Profile, ProfileId } from '../../../domain/profile'

export interface UseProfileResult {
  profile: Profile | null
  isLoading: boolean
  error: string | null
}

export function useProfile(id: ProfileId): UseProfileResult {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setIsLoading(true)
    setError(null)
    window.claudeApi.profiles.get(id)
      .then((result) => {
        if (result.ok) {
          setProfile(result.value)
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
  }, [id])

  return { profile, isLoading, error }
}
