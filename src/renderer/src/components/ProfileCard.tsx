import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { useProfileDiskUsage } from '../hooks/useProfileDiskUsage'
import type { Profile } from '../../../domain/profile'

export interface ProfileCardProps {
  profile: Profile
  isRunning?: boolean
  onLaunch: (profile: Profile) => void
  onStop: (profile: Profile) => void
  onEdit: (profile: Profile) => void
  onDelete: (profile: Profile) => void
  onCleanup: (profile: Profile) => void
}

const DISK_HIGH_BYTES = 6 * 1024 * 1024 * 1024  // 6 GB
const DISK_MID_BYTES  = 2 * 1024 * 1024 * 1024  // 2 GB

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

function diskBarColor(bytes: number): string {
  if (bytes > DISK_HIGH_BYTES) return 'bg-red-500'
  if (bytes > DISK_MID_BYTES) return 'bg-yellow-400'
  return 'bg-green-500'
}

export function ProfileCard({
  profile,
  isRunning = false,
  onLaunch,
  onStop,
  onEdit,
  onDelete,
  onCleanup,
}: ProfileCardProps): React.JSX.Element {
  const { bytes, isLoading: diskLoading } = useProfileDiskUsage(profile.id)
  const fillPct = bytes != null ? Math.min((bytes / DISK_HIGH_BYTES) * 100, 100) : 0

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
        <p className="text-xs text-gray-500 truncate mb-2">{profile.homeDir}</p>

        {/* Disk usage bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-500">Disk</span>
            <span className={`text-xs font-medium ${bytes != null && bytes > DISK_HIGH_BYTES ? 'text-red-400' : 'text-gray-400'}`}>
              {diskLoading ? '…' : bytes != null ? formatBytes(bytes) : '—'}
            </span>
          </div>
          <div className="h-1 rounded-full bg-[#2a2a2a] overflow-hidden">
            {bytes != null && (
              <div
                className={`h-full rounded-full transition-all ${diskBarColor(bytes)}`}
                style={{ width: `${fillPct}%` }}
              />
            )}
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          {isRunning ? (
            <Button variant="destructive" size="sm" onClick={() => onStop(profile)}>Stop</Button>
          ) : (
            <Button size="sm" onClick={() => onLaunch(profile)}>Launch</Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => onEdit(profile)}>Edit</Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-orange-400 hover:text-orange-300 hover:bg-orange-950"
            onClick={() => onCleanup(profile)}
          >
            🧹 Clean
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-red-400 hover:text-red-300 hover:bg-red-950"
            onClick={() => onDelete(profile)}
          >
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
