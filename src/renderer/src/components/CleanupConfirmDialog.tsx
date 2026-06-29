import React, { useState } from 'react'
import { Button } from './ui/button'
import type { Profile } from '../../../domain/profile'

export interface CleanupConfirmDialogProps {
  profile: Profile | null
  onClose: () => void
  onCleaned: () => void
}

const CACHE_DIRS = [
  'Cache', 'Code Cache', 'GPU Cache',
  'DawnGraphiteCache', 'DawnWebGPUCache',
  'VideoDecodeStats', 'blob_storage', 'Crashpad',
]

export function CleanupConfirmDialog({ profile, onClose, onCleaned }: CleanupConfirmDialogProps): React.JSX.Element | null {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [freedBytes, setFreedBytes] = useState<number | null>(null)

  if (!profile) return null

  async function handleConfirm(): Promise<void> {
    if (!profile) return
    setIsLoading(true)
    setError(null)
    const result = await window.claudeApi.profiles.cleanup(profile.id)
    setIsLoading(false)
    if (!result.ok) {
      const errCode = (result.error as unknown as { code?: string }).code
      const msg = errCode === 'PROFILE_RUNNING'
        ? 'Stop this profile before cleaning up.'
        : 'Cleanup failed. Please try again.'
      setError(msg)
      return
    }
    setFreedBytes(result.value.bytesFreed)
    onCleaned()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 w-[420px] shadow-2xl">
        {freedBytes !== null ? (
          <>
            <h2 className="text-lg font-semibold text-white mb-2">Cleanup complete</h2>
            <p className="text-sm text-gray-400 mb-4">
              Freed <span className="text-white font-medium">{formatBytes(freedBytes)}</span> from <span className="text-white">{profile.icon} {profile.name}</span>.
            </p>
            <Button onClick={onClose}>Done</Button>
          </>
        ) : (
          <>
            <h2 className="text-lg font-semibold text-white mb-2">
              Clean up {profile.icon} {profile.name}?
            </h2>
            <p className="text-sm text-gray-400 mb-3">The following cache directories will be deleted:</p>
            <ul className="text-xs text-gray-500 mb-4 space-y-1">
              {CACHE_DIRS.map((d) => <li key={d} className="font-mono">{d}/</li>)}
            </ul>
            <p className="text-xs text-gray-600 mb-4">
              Sessions, conversations, and preferences are kept.
            </p>
            {error && <p className="text-sm text-red-400 mb-3">{error}</p>}
            <div className="flex gap-3">
              <Button onClick={handleConfirm} disabled={isLoading} variant="destructive">
                {isLoading ? 'Cleaning…' : 'Clean up'}
              </Button>
              <Button variant="ghost" onClick={onClose} disabled={isLoading}>Cancel</Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}
