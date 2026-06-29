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

  useEffect(() => {
    if (settings) {
      setBinaryPath(settings.claudeBinaryPath ?? '')
    }
  }, [settings])

  async function handleSave(e: React.FormEvent): Promise<void> {
    e.preventDefault()
    if (!settings) return
    const ok = await saveSettings({
      ...settings,
      claudeBinaryPath: binaryPath.trim() || null,
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
          <label htmlFor="binary-path" className="block text-sm font-medium text-gray-300 mb-1">
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
          <div className="mt-2 rounded-md p-3 text-xs text-gray-400 space-y-1" style={{ backgroundColor: '#0d0d0d', border: '1px solid #2a2a2a' }}>
            <p className="font-medium text-gray-300">How to find the path on Windows:</p>
            <p>1. Open Claude Desktop, then open <span className="text-gray-200">Task Manager</span></p>
            <p>2. Find <span className="text-gray-200">Claude</span> in the list → right-click → <span className="text-gray-200">Open file location</span></p>
            <p>3. Copy the full path to <span className="text-gray-200">claude.exe</span>, e.g.:</p>
            <p className="font-mono text-gray-300 break-all select-all">C:\Program Files\WindowsApps\Claude_1.x_x64__xxx\app\claude.exe</p>
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
