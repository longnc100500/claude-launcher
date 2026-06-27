import React, { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { useSettings } from '../hooks/useSettings'
import { toast } from './ui/toast'

export interface SettingsPageProps {
  onClose: () => void
}

export function SettingsPage({ onClose }: SettingsPageProps): React.JSX.Element {
  const { settings, isLoading, isSaving, saveSettings } = useSettings()
  const [binaryPath, setBinaryPath] = useState('')
  const [theme, setTheme] = useState<'system' | 'light' | 'dark'>('system')

  useEffect(() => {
    if (settings) {
      setBinaryPath(settings.claudeBinaryPath ?? '')
      setTheme(settings.theme)
    }
  }, [settings])

  async function handleSave(e: React.FormEvent): Promise<void> {
    e.preventDefault()
    if (!settings) return
    const ok = await saveSettings({
      ...settings,
      claudeBinaryPath: binaryPath.trim() || null,
      theme,
    })
    if (ok) {
      toast.success('Settings saved.')
      onClose()
    }
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <p className="text-gray-500">Loading settings…</p>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Settings</h2>
        <Button variant="ghost" size="sm" onClick={onClose}>← Back</Button>
      </div>
      <form onSubmit={handleSave} className="space-y-6">
        <div>
          <label htmlFor="binary-path" className="block text-sm font-medium text-gray-700 mb-1">
            Claude Desktop binary path
          </label>
          <Input
            id="binary-path"
            value={binaryPath}
            onChange={(e) => setBinaryPath(e.target.value)}
            placeholder="/Applications/Claude.app/Contents/MacOS/Claude"
          />
          <p className="mt-1 text-xs text-gray-400">
            Leave empty to auto-detect. Required if Claude Desktop is in a non-standard location.
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
          <div className="flex gap-2">
            {(['system', 'light', 'dark'] as const).map((t) => (
              <Button
                key={t}
                type="button"
                variant={theme === t ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme(t)}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </Button>
            ))}
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'Saving…' : 'Save Settings'}
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
