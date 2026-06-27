import { useState, useCallback } from 'react'
import type { ProfileId } from '../../../domain/profile'

export interface UseDeleteProfileResult {
  deleteProfile: (id: ProfileId) => Promise<boolean>
  isLoading: boolean
  error: string | null
  reset: () => void
}

export function useDeleteProfile(): UseDeleteProfileResult {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const deleteProfile = useCallback(async (id: ProfileId): Promise<boolean> => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await window.claudeApi.profiles.delete(id)
      if (result.ok) {
        return true
      }
      setError(result.error.message)
      return false
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  const reset = useCallback(() => {
    setError(null)
  }, [])

  return { deleteProfile, isLoading, error, reset }
}
