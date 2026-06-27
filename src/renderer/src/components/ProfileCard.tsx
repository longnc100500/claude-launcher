import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import type { Profile } from '../../../domain/profile'

export interface ProfileCardProps {
  profile: Profile
  isRunning?: boolean
  onLaunch: (profile: Profile) => void
  onStop: (profile: Profile) => void
  onEdit: (profile: Profile) => void
  onDelete: (profile: Profile) => void
}

export function ProfileCard({
  profile,
  isRunning = false,
  onLaunch,
  onStop,
  onEdit,
  onDelete,
}: ProfileCardProps): React.JSX.Element {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {profile.icon && <span className="text-xl">{profile.icon}</span>}
            <CardTitle className="text-base">{profile.name}</CardTitle>
          </div>
          {isRunning && <Badge variant="success">Running</Badge>}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-gray-400 truncate mb-3">{profile.homeDir}</p>
        <div className="flex gap-2">
          {isRunning ? (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onStop(profile)}
            >
              Stop
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => onLaunch(profile)}
            >
              Launch
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => onEdit(profile)}>
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={() => onDelete(profile)}
          >
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
