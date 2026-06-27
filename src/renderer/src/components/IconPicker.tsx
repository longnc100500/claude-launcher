import React from 'react'
import { cn } from '../lib/utils'

const ICON_OPTIONS = [
  '💼', '🏠', '🎓', '🔬', '🎨', '🎮', '📚', '🌱',
  '🚀', '💡', '🔧', '📊', '✍️', '🎵', '🌍', '⚡',
]

export interface IconPickerProps {
  value: string | null
  onChange: (icon: string | null) => void
}

export function IconPicker({ value, onChange }: IconPickerProps): React.JSX.Element {
  return (
    <div>
      <p className="text-sm font-medium text-gray-700 mb-2">Icon (optional)</p>
      <div className="flex flex-wrap gap-1">
        <button
          type="button"
          onClick={() => onChange(null)}
          className={cn(
            'w-9 h-9 rounded-md border text-sm transition-colors',
            value === null
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300',
          )}
          aria-label="No icon"
          aria-pressed={value === null}
        >
          —
        </button>
        {ICON_OPTIONS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => onChange(emoji)}
            className={cn(
              'w-9 h-9 rounded-md border text-lg transition-colors',
              value === emoji
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300',
            )}
            aria-label={`Select icon ${emoji}`}
            aria-pressed={value === emoji}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  )
}
