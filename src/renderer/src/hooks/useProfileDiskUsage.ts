import { useState, useEffect } from 'react'
import type { ProfileId } from '../../../domain/profile'

export interface DiskUsageState {
  bytes: number | null
  isLoading: boolean
}

export function useProfileDiskUsage(profileId: ProfileId): DiskUsageState & { refetch: () => void } {
  const [bytes, setBytes] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    window.claudeApi.profiles.diskUsage(profileId).then((result) => {
      if (cancelled) return
      setBytes(result.ok ? result.value.bytes : null)
      setIsLoading(false)
    })
    return () => { cancelled = true }
  }, [profileId, tick])

  return { bytes, isLoading, refetch: () => setTick((t) => t + 1) }
}
