import React from 'react'
import { Button } from './components/ui/button'

export default function App(): React.JSX.Element {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">Claude Launcher</h1>
          <Button variant="outline" size="sm">Settings</Button>
        </div>
      </header>
      <main className="p-6">
        <p className="text-gray-500">Profile list coming soon.</p>
      </main>
    </div>
  )
}
