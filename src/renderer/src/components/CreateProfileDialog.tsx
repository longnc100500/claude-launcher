import React, { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { IconPicker } from './IconPicker'

export interface CreateProfileDialogProps {
  isOpen: boolean
  isLoading: boolean
  error: string | null
  onSubmit: (name: string, icon: string | null) => void
  onClose: () => void
}

export function CreateProfileDialog({
  isOpen,
  isLoading,
  error,
  onSubmit,
  onClose,
}: CreateProfileDialogProps): React.JSX.Element | null {
  const [name, setName] = useState('')
  const [icon, setIcon] = useState<string | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)

  if (!isOpen) return null

  function handleSubmit(e: React.FormEvent): void {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) {
      setValidationError('Profile name is required')
      return
    }
    if (trimmed.length > 64) {
      setValidationError('Profile name must be 64 characters or fewer')
      return
    }
    setValidationError(null)
    onSubmit(trimmed, icon)
  }

  function handleClose(): void {
    setName('')
    setIcon(null)
    setValidationError(null)
    onClose()
  }

  const displayError = validationError ?? error

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-profile-title"
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      <div
        className="absolute inset-0 bg-black/50"
        onClick={handleClose}
        aria-hidden="true"
      />
      <div className="relative bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
        <h2 id="create-profile-title" className="text-lg font-semibold mb-4">
          Create Profile
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="profile-name" className="block text-sm font-medium text-gray-700 mb-1">
              Profile name
            </label>
            <Input
              id="profile-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Work, Personal, Research"
              disabled={isLoading}
              autoFocus
            />
            {displayError && (
              <p role="alert" className="mt-1 text-sm text-red-600">
                {displayError}
              </p>
            )}
          </div>
          <div className="mb-4">
            <IconPicker value={icon} onChange={setIcon} />
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating…' : 'Create'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
