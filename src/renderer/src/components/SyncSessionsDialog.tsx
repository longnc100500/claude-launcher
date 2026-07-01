import React, { useState, useEffect } from 'react'
import type { Profile, ProfileId } from '../../../domain/profile'
import type { ClaudeProject, ClaudeSessionFile } from '../../../domain/session'
import { useSyncSessions } from '../hooks/useSyncSessions'
import type { SessionFileRef } from '../hooks/useSyncSessions'
import { toast } from './ui/toast'
import { Button } from './ui/button'

interface SyncSessionsDialogProps {
  sourceProfile: Profile | null
  allProfiles: ReadonlyArray<Profile>
  onClose: () => void
}

function formatRelativeTime(rawDate: Date | string): string {
  const date = rawDate instanceof Date ? rawDate : new Date(rawDate as string)
  const diffMs = Date.now() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  return `${Math.floor(diffHours / 24)}d ago`
}

type Step = 'projects' | 'sessions'

// Inner component — always has a non-null sourceProfile, safe to use hooks
function SyncSessionsDialogInner({
  sourceProfile,
  allProfiles,
  onClose,
}: {
  sourceProfile: Profile
  allProfiles: ReadonlyArray<Profile>
  onClose: () => void
}): React.JSX.Element {
  const otherProfiles = allProfiles.filter((p) => p.id !== sourceProfile.id)
  const [step, setStep] = useState<Step>('projects')
  const [projects, setProjects] = useState<ClaudeProject[]>([])
  const [selectedProject, setSelectedProject] = useState<ClaudeProject | null>(null)
  const [sessionFiles, setSessionFiles] = useState<ClaudeSessionFile[]>([])
  const [selectedSessionIds, setSelectedSessionIds] = useState<Set<string>>(new Set())
  const [selectedProfileIds, setSelectedProfileIds] = useState<Set<ProfileId>>(new Set())

  const {
    listProjects,
    listSessionFiles,
    syncSessions,
    isLoadingProjects,
    isLoadingFiles,
    isSyncing,
    error,
    reset,
  } = useSyncSessions()
  
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    void listProjects(sourceProfile.id).then(setProjects)
  }, [listProjects, sourceProfile.id, refreshKey])
  function handleClose(): void {
    reset()
    setStep('projects')
    setProjects([])
    setSelectedProject(null)
    setSessionFiles([])
    setSelectedSessionIds(new Set())
    setSelectedProfileIds(new Set())
    onClose()
  }

  async function handleSelectProject(project: ClaudeProject): Promise<void> {
    setSelectedProject(project)
    setSelectedSessionIds(new Set())
    setSessionFiles([])
    setStep('sessions')
    const files = await listSessionFiles(sourceProfile.id, project.id)
    setSessionFiles(files)
  }

  function toggleSession(id: string): void {
    setSelectedSessionIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleProfile(id: ProfileId): void {
    setSelectedProfileIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function handleSync(): Promise<void> {
    if (!selectedProject || selectedSessionIds.size === 0 || selectedProfileIds.size === 0) return
    const files: SessionFileRef[] = [...selectedSessionIds].map((sessionId) => ({
      projectId: selectedProject.id,
      sessionId,
    }))
    const ok = await syncSessions(sourceProfile.id, files, [...selectedProfileIds])
    if (ok) {
      const sessionCount = selectedSessionIds.size
      const profileCount = selectedProfileIds.size
      toast.success(
        `${sessionCount} session${sessionCount > 1 ? 's' : ''} synced to ${profileCount} profile${profileCount > 1 ? 's' : ''}. Restart the target profile${profileCount > 1 ? 's' : ''} in Claude Desktop for the sessions to appear.`,
      )
      handleClose()
    }
  }

  const canSync = selectedSessionIds.size > 0 && selectedProfileIds.size > 0 && !isSyncing

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 w-[480px] max-h-[80vh] flex flex-col shadow-2xl">

        {/* Header */}
        <div className="flex items-center gap-2 mb-1">
          {step === 'sessions' && (
            <button
              onClick={() => { setStep('projects'); setSelectedProject(null) }}
              className="text-gray-400 hover:text-white transition-colors text-sm px-1"
              aria-label="Back to projects"
            >
              ←
            </button>
          )}
          <h2 className="text-lg font-semibold text-white">Sync Sessions</h2>
          {step === 'projects' && (
            <button
              onClick={() => setRefreshKey((k) => k + 1)}
              disabled={isLoadingProjects}
              className="ml-auto text-gray-400 hover:text-white transition-colors text-sm disabled:opacity-40"
              aria-label="Refresh"
              title="Refresh"
            >
              ↻
            </button>
          )}
        </div>
        <p className="text-sm text-gray-400 mb-4">
          {step === 'projects' ? (
            <>From <span className="font-medium text-white">{sourceProfile.icon} {sourceProfile.name}</span> — select a project</>
          ) : (
            <>Project: <span className="font-medium text-white">{selectedProject?.name}</span></>
          )}
        </p>

        {/* Step 1: Project list */}
        {step === 'projects' && (
          <>
            <div className="flex-1 overflow-y-auto min-h-0">
              {isLoadingProjects ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-5 h-5 border-2 border-gray-600 border-t-white rounded-full animate-spin" />
                </div>
              ) : projects.length === 0 ? (
                <p className="text-sm text-gray-500 py-4 text-center">No projects found.</p>
              ) : (
                <div className="space-y-1">
                  {projects.map((project) => (
                    <button
                      key={project.id}
                      onClick={() => void handleSelectProject(project)}
                      className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors text-left"
                    >
                      <div className="min-w-0">
                        <p className="text-sm text-gray-200 truncate">{project.name}</p>
                        <p className="text-xs text-gray-500 truncate">{project.id}</p>
                      </div>
                      <span className="text-xs text-gray-500 flex-shrink-0 ml-3">
                        {formatRelativeTime(project.lastModified)} →
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="mt-4">
              <Button variant="ghost" onClick={handleClose}>Cancel</Button>
            </div>
          </>
        )}

        {/* Step 2: Session files + target profiles */}
        {step === 'sessions' && (
          <>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
              Choose sessions:
            </p>
            <div className="flex-1 overflow-y-auto min-h-0 mb-4">
              {isLoadingFiles ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-5 h-5 border-2 border-gray-600 border-t-white rounded-full animate-spin" />
                </div>
              ) : sessionFiles.length === 0 ? (
                <p className="text-sm text-gray-500 py-4 text-center">No sessions in this project.</p>
              ) : (
                <div className="space-y-1">
                  {sessionFiles.map((sf) => (
                    <label
                      key={sf.id}
                      className="flex items-start gap-3 p-2 rounded-lg cursor-pointer hover:bg-white/5 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedSessionIds.has(sf.id)}
                        onChange={() => toggleSession(sf.id)}
                        className="mt-0.5 w-4 h-4 accent-white cursor-pointer flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-200 truncate">{sf.name}</p>
                        <p className="text-sm text-gray-200 truncate">{sf.id}</p>
                        <p className="text-xs text-gray-500">{formatRelativeTime(sf.lastModified)}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-[#2a2a2a] mb-4" />

            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
              Copy to:
            </p>
            {otherProfiles.length === 0 ? (
              <p className="text-sm text-gray-500 mb-4">No other profiles available.</p>
            ) : (
              <div className="space-y-2 mb-4">
                {otherProfiles.map((profile) => (
                  <label key={profile.id} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedProfileIds.has(profile.id)}
                      onChange={() => toggleProfile(profile.id)}
                      className="w-4 h-4 accent-white cursor-pointer"
                    />
                    <span className="text-sm text-gray-300">
                      {profile.icon} {profile.name}
                    </span>
                  </label>
                ))}
              </div>
            )}

            {error !== null && <p className="mb-3 text-sm text-red-400">{error}</p>}

            <div className="flex gap-3">
              <Button onClick={handleSync} disabled={!canSync}>
                {isSyncing
                  ? 'Syncing…'
                  : `Sync ${selectedSessionIds.size} session${selectedSessionIds.size !== 1 ? 's' : ''}`}
              </Button>
              <Button variant="ghost" onClick={handleClose} disabled={isSyncing}>
                Cancel
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// Outer wrapper — only mounts inner component when sourceProfile is non-null,
// ensuring hooks always run with valid data and reset cleanly between profiles.
export function SyncSessionsDialog({
  sourceProfile,
  allProfiles,
  onClose,
}: SyncSessionsDialogProps): React.JSX.Element | null {
  if (!sourceProfile) return null
  return (
    <SyncSessionsDialogInner
      key={sourceProfile.id}
      sourceProfile={sourceProfile}
      allProfiles={allProfiles}
      onClose={onClose}
    />
  )
}
