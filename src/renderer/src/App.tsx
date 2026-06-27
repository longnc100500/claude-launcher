import React, { useState } from 'react'
import { useProfiles } from './hooks/useProfiles'
import { useCreateProfile } from './hooks/useCreateProfile'
import { ProfileList } from './components/ProfileList'
import { CreateProfileDialog } from './components/CreateProfileDialog'
import { Button } from './components/ui/button'
import type { Profile } from '../../domain/profile'

export default function App(): React.JSX.Element {
  const { profiles, isLoading, error, refresh } = useProfiles()
  const { createProfile, isLoading: isCreating, error: createError, reset: resetCreate } = useCreateProfile()
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  async function handleCreate(name: string): Promise<void> {
    const profile = await createProfile({ name })
    if (profile) {
      setShowCreateDialog(false)
      resetCreate()
      refresh()
    }
  }

  function handleCloseDialog(): void {
    setShowCreateDialog(false)
    resetCreate()
  }

  function handleLaunch(_profile: Profile): void {
    // TODO: PR-21 — launch hook
  }

  function handleStop(_profile: Profile): void {
    // TODO: PR-21 — stop hook
  }

  function handleEdit(_profile: Profile): void {
    // TODO: PR-20 — edit dialog
  }

  function handleDelete(_profile: Profile): void {
    // TODO: PR-20 — delete confirm dialog
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">Claude Launcher</h1>
          <div className="flex gap-2">
            <Button onClick={() => setShowCreateDialog(true)}>New Profile</Button>
            <Button variant="outline" size="sm">Settings</Button>
          </div>
        </div>
      </header>
      <main className="p-6">
        <ProfileList
          profiles={profiles}
          isLoading={isLoading}
          error={error}
          runningProfileIds={new Set()}
          onLaunch={handleLaunch}
          onStop={handleStop}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onCreateNew={() => setShowCreateDialog(true)}
        />
      </main>
      <CreateProfileDialog
        isOpen={showCreateDialog}
        isLoading={isCreating}
        error={createError}
        onSubmit={handleCreate}
        onClose={handleCloseDialog}
      />
    </div>
  )
}
