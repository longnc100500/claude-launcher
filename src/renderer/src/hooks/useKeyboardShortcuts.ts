import { useEffect, useRef } from 'react'

export interface KeyboardShortcutHandlers {
  onNewProfile: () => void
  onCloseDialog: () => void
  onOpenSettings: () => void
  onQuickSwitcher: () => void
}

export function useKeyboardShortcuts(handlers: KeyboardShortcutHandlers): void {
  const handlersRef = useRef(handlers)
  handlersRef.current = handlers

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent): void {
      const isMod = event.metaKey || event.ctrlKey

      if (isMod && event.key === 'n') {
        event.preventDefault()
        handlersRef.current.onNewProfile()
        return
      }

      if (isMod && event.key === 'k') {
        event.preventDefault()
        handlersRef.current.onQuickSwitcher()
        return
      }

      if (event.key === 'Escape') {
        handlersRef.current.onCloseDialog()
        return
      }

      if (isMod && event.key === ',') {
        event.preventDefault()
        handlersRef.current.onOpenSettings()
        return
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])
}
