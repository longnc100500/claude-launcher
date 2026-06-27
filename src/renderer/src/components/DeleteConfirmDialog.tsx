import React from 'react'
import { Button } from './ui/button'
import type { Profile } from '../../../domain/profile'

export interface DeleteConfirmDialogProps {
  profile: Profile | null
  isLoading: boolean
  onConfirm: () => void
  onClose: () => void
}

export function DeleteConfirmDialog({
  profile,
  isLoading,
  onConfirm,
  onClose,
}: DeleteConfirmDialogProps): React.JSX.Element | null {
  if (!profile) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-profile-title"
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div className="relative bg-white rounded-lg shadow-xl p-6 w-full max-w-sm mx-4">
        <h2 id="delete-profile-title" className="text-lg font-semibold mb-2">
          Delete Profile
        </h2>
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete <strong>{profile.name}</strong>? This will also delete its home directory and all data inside it.
        </p>
        <div className="flex gap-2 justify-end">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? 'Deleting…' : 'Delete'}
          </Button>
        </div>
      </div>
    </div>
  )
}
