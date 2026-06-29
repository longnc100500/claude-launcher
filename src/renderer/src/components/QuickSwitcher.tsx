import React, { useState, useEffect, useRef } from 'react'
import type { Profile } from '../../../domain/profile'

export interface QuickSwitcherProps {
  profiles: ReadonlyArray<Profile>
  runningProfileIds: ReadonlySet<string>
  onLaunch: (profile: Profile) => void
  onClose: () => void
}

export function QuickSwitcher({
  profiles,
  runningProfileIds,
  onLaunch,
  onClose,
}: QuickSwitcherProps): React.JSX.Element {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const filtered = profiles.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase())
  )

  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  function handleKeyDown(e: React.KeyboardEvent): void {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const profile = filtered[selectedIndex]
      if (profile) {
        onLaunch(profile)
        onClose()
      }
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-32 bg-black/60"
      onClick={onClose}
    >
      <div
        className="w-[480px] rounded-xl border border-blue-500/40 bg-[#1a1a1a] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[#2a2a2a]">
          <span className="text-gray-500 text-sm">🔍</span>
          <input
            ref={inputRef}
            className="flex-1 bg-transparent text-white text-base outline-none placeholder:text-gray-600"
            placeholder="Search profiles…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>

        <div className="py-1">
          {filtered.length === 0 && (
            <p className="px-4 py-3 text-sm text-gray-600">No profiles found</p>
          )}
          {filtered.map((profile, index) => {
            const isRunning = runningProfileIds.has(profile.id)
            return (
              <div
                key={profile.id}
                className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer ${
                  index === selectedIndex ? 'bg-blue-950' : 'hover:bg-[#222]'
                }`}
                onClick={() => {
                  onLaunch(profile)
                  onClose()
                }}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <span className="w-6 text-center text-base">
                  {profile.icon ?? '○'}
                </span>
                <span className="flex-1 text-sm font-medium text-white">
                  {profile.name}
                </span>
                <span
                  className={`text-xs ${
                    isRunning ? 'text-green-400' : 'text-gray-600'
                  }`}
                >
                  {isRunning ? '● Running — focus' : 'Stopped — launch'}
                </span>
              </div>
            )
          })}
        </div>

        <div className="flex gap-4 px-4 py-2 border-t border-[#2a2a2a]">
          {[
            ['↑↓', 'navigate'],
            ['↵', 'launch / focus'],
            ['Esc', 'close'],
          ].map(([key, label]) => (
            <span key={key} className="flex items-center gap-1 text-xs text-gray-600">
              <kbd className="bg-[#222] border border-[#333] rounded px-1 py-0.5 font-mono">
                {key}
              </kbd>
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
