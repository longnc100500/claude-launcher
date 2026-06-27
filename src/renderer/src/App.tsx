import React, { useState } from 'react'
import { useProfiles } from './hooks/useProfiles'
import { useCreateProfile } from './hooks/useCreateProfile'
import { useUpdateProfile } from './hooks/useUpdateProfile'
import { useDeleteProfile } from './hooks/useDeleteProfile'
import { useLaunchStatus } from './hooks/useLaunchStatus'
import { ProfileList } from './components/ProfileList'
import { CreateProfileDialog } from './components/CreateProfileDialog'
import { EditProfileDialog } from './components/EditProfileDialog'
import { DeleteConfirmDialog } from './components/DeleteConfirmDialog'
import { Button } from './components/ui/button'
import { toast } from './components/ui/toast'
import { getUserFriendlyError } from './lib/errorMessages'
import type { Profile } from '../../domain/profile'

export default function App(): React.JSX.Element {
  const { profiles, isLoading, error, refresh } = useProfiles()
  const { createProfile, isLoading: isCreating, error: createError, reset: resetCreate } = useCreateProfile()
  const { updateProfile, isLoading: isUpdating, error: updateError, reset: resetUpdate } = useUpdateProfile()
  const { deleteProfile, isLoading: isDeleting } = useDeleteProfile()
  const { runningProfileIds, launch, stop } = useLaunchStatus()

  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null)
  const [deletingProfile, setDeletingProfile] = useState<Profile | null>(null)

  async function handleCreate(name: string): Promise<void> {
    const profile = await createProfile({ name })
    if (profile) {
      toast.success(`Profile "${profile.name}" created.`)
      setShowCreateDialog(false)
      resetCreate()
      refresh()
    }
  }

  async function handleUpdate(name: string): Promise<void> {
    if (!editingProfile) return
    const updated = await updateProfile(editingProfile.id, { name })
    if (updated) {
      setEditingProfile(null)
      resetUpdate()
      refresh()
    }
  }

  async function handleDelete(): Promise<void> {
    if (!deletingProfile) return
    const ok = await deleteProfile(deletingProfile.id)
    if (ok) {
      setDeletingProfile(null)
      refresh()
    }
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
          runningProfileIds={runningProfileIds}
          onLaunch={async (p) => {
            const ok = await launch(p.id)
            if (!ok) {
              toast.error(getUserFriendlyError('BINARY_NOT_FOUND'))
            }
          }}
          onStop={async (p) => {
            const ok = await stop(p.id)
            if (!ok) {
              toast.error('Failed to stop profile.')
            }
          }}
          onEdit={setEditingProfile}
          onDelete={setDeletingProfile}
          onCreateNew={() => setShowCreateDialog(true)}
        />
      </main>
      <CreateProfileDialog
        isOpen={showCreateDialog}
        isLoading={isCreating}
        error={createError}
        onSubmit={handleCreate}
        onClose={() => { setShowCreateDialog(false); resetCreate() }}
      />
      <EditProfileDialog
        profile={editingProfile}
        isLoading={isUpdating}
        error={updateError}
        onSubmit={handleUpdate}
        onClose={() => { setEditingProfile(null); resetUpdate() }}
      />
      <DeleteConfirmDialog
        profile={deletingProfile}
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onClose={() => setDeletingProfile(null)}
      />
    </div>
  )
}
