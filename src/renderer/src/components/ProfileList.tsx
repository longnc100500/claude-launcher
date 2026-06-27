import React from 'react'
import { ProfileCard } from './ProfileCard'
import { Button } from './ui/button'
import type { Profile } from '../../../domain/profile'

export interface ProfileListProps {
  profiles: ReadonlyArray<Profile>
  isLoading: boolean
  error: string | null
  runningProfileIds: ReadonlySet<string>
  onLaunch: (profile: Profile) => void
  onStop: (profile: Profile) => void
  onEdit: (profile: Profile) => void
  onDelete: (profile: Profile) => void
  onCreateNew: () => void
}

function EmptyState({ onCreateNew }: { onCreateNew: () => void }): React.JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <p className="text-gray-500 mb-4">No profiles yet. Create one to get started.</p>
      <Button onClick={onCreateNew}>Create Profile</Button>
    </div>
  )
}

function LoadingSkeleton(): React.JSX.Element {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-32 rounded-lg border border-gray-200 bg-gray-100 animate-pulse"
        />
      ))}
    </div>
  )
}

export function ProfileList({
  profiles,
  isLoading,
  error,
  runningProfileIds,
  onLaunch,
  onStop,
  onEdit,
  onDelete,
  onCreateNew,
}: ProfileListProps): React.JSX.Element {
  if (isLoading) return <LoadingSkeleton />

  if (error !== null) {
    return (
      <div className="rounded-md bg-red-50 border border-red-200 p-4 text-red-800">
        <p className="font-medium">Failed to load profiles</p>
        <p className="text-sm">{error}</p>
      </div>
    )
  }

  if (profiles.length === 0) {
    return <EmptyState onCreateNew={onCreateNew} />
  }

  return (
    <div
      role="list"
      aria-label="Profile list"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      {profiles.map((profile) => (
        <div key={profile.id} role="listitem">
          <ProfileCard
            profile={profile}
            isRunning={runningProfileIds.has(profile.id)}
            onLaunch={onLaunch}
            onStop={onStop}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </div>
      ))}
    </div>
  )
}
