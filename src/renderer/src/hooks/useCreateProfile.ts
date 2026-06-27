import { useState, useCallback } from 'react'
import type { Profile, CreateProfileInput } from '../../../domain/profile'

export interface UseCreateProfileResult {
  createProfile: (input: CreateProfileInput) => Promise<Profile | null>
  isLoading: boolean
  error: string | null
  reset: () => void
}

export function useCreateProfile(): UseCreateProfileResult {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createProfile = useCallback(async (input: CreateProfileInput): Promise<Profile | null> => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await window.claudeApi.profiles.create(input)
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

  return { createProfile, isLoading, error, reset }
}
