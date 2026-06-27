import { useState, useEffect, useCallback } from 'react'
import type { AppSettings } from '../../../domain/settings'

export interface UseSettingsResult {
  settings: AppSettings | null
  isLoading: boolean
  isSaving: boolean
  error: string | null
  saveSettings: (settings: AppSettings) => Promise<boolean>
}

export function useSettings(): UseSettingsResult {
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    window.claudeApi.settings.get()
      .then((result) => {
        if (result.ok) {
          setSettings(result.value as AppSettings)
        } else {
          setError(result.error.message)
        }
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Unknown error')
      })
      .finally(() => setIsLoading(false))
  }, [])

  const saveSettings = useCallback(async (newSettings: AppSettings): Promise<boolean> => {
    setIsSaving(true)
    setError(null)
    try {
      const result = await window.claudeApi.settings.save(newSettings)
      if (result.ok) {
        setSettings(newSettings)
        return true
      }
      setError(result.error.message)
      return false
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      return false
    } finally {
      setIsSaving(false)
    }
  }, [])

  return { settings, isLoading, isSaving, error, saveSettings }
}
