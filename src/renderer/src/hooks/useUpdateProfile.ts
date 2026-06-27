import { useState, useCallback } from 'react'
import type { Profile, ProfileId, UpdateProfileInput } from '../../../domain/profile'

export interface UseUpdateProfileResult {
  updateProfile: (id: ProfileId, input: UpdateProfileInput) => Promise<Profile | null>
  isLoading: boolean
  error: string | null
  reset: () => void
}

export function useUpdateProfile(): UseUpdateProfileResult {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateProfile = useCallback(async (id: ProfileId, input: UpdateProfileInput): Promise<Profile | null> => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await window.claudeApi.profiles.update(id, input)
      if (result.ok) {
        return result.value
      }
      setError(result.error.message)
      return null
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const reset = useCallback(() => {
    setError(null)
  }, [])

  return { updateProfile, isLoading, error, reset }
}
