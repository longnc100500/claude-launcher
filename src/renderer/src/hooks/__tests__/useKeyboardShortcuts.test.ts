import { describe, it, expect, vi, afterEach } from 'vitest'
import { renderHook, act, cleanup } from '@testing-library/react'
import { useKeyboardShortcuts } from '../useKeyboardShortcuts'

afterEach(cleanup)

function fireKey(key: string, options: Partial<KeyboardEventInit> = {}): void {
  window.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, ...options }))
}

describe('useKeyboardShortcuts', () => {
  it('calls onNewProfile on Cmd+N', () => {
    const onNewProfile = vi.fn()
    renderHook(() => useKeyboardShortcuts({ onNewProfile, onCloseDialog: vi.fn(), onOpenSettings: vi.fn(), onQuickSwitcher: vi.fn() }))
    act(() => fireKey('n', { metaKey: true }))
    expect(onNewProfile).toHaveBeenCalledOnce()
  })

  it('calls onNewProfile on Ctrl+N', () => {
    const onNewProfile = vi.fn()
    renderHook(() => useKeyboardShortcuts({ onNewProfile, onCloseDialog: vi.fn(), onOpenSettings: vi.fn(), onQuickSwitcher: vi.fn() }))
    act(() => fireKey('n', { ctrlKey: true }))
    expect(onNewProfile).toHaveBeenCalledOnce()
  })

  it('calls onCloseDialog on Escape', () => {
    const onCloseDialog = vi.fn()
    renderHook(() => useKeyboardShortcuts({ onNewProfile: vi.fn(), onCloseDialog, onOpenSettings: vi.fn(), onQuickSwitcher: vi.fn() }))
    act(() => fireKey('Escape'))
    expect(onCloseDialog).toHaveBeenCalledOnce()
  })

  it('calls onOpenSettings on Cmd+,', () => {
    const onOpenSettings = vi.fn()
    renderHook(() => useKeyboardShortcuts({ onNewProfile: vi.fn(), onCloseDialog: vi.fn(), onOpenSettings, onQuickSwitcher: vi.fn() }))
    act(() => fireKey(',', { metaKey: true }))
    expect(onOpenSettings).toHaveBeenCalledOnce()
  })

  it('calls onQuickSwitcher on Cmd+K', () => {
    const onQuickSwitcher = vi.fn()
    renderHook(() => useKeyboardShortcuts({ onNewProfile: vi.fn(), onCloseDialog: vi.fn(), onOpenSettings: vi.fn(), onQuickSwitcher }))
    act(() => fireKey('k', { metaKey: true }))
    expect(onQuickSwitcher).toHaveBeenCalledOnce()
  })

  it('calls onQuickSwitcher on Ctrl+K', () => {
    const onQuickSwitcher = vi.fn()
    renderHook(() => useKeyboardShortcuts({ onNewProfile: vi.fn(), onCloseDialog: vi.fn(), onOpenSettings: vi.fn(), onQuickSwitcher }))
    act(() => fireKey('k', { ctrlKey: true }))
    expect(onQuickSwitcher).toHaveBeenCalledOnce()
  })

  it('cleans up event listener on unmount', () => {
    const spy = vi.spyOn(window, 'removeEventListener')
    const { unmount } = renderHook(() =>
      useKeyboardShortcuts({ onNewProfile: vi.fn(), onCloseDialog: vi.fn(), onOpenSettings: vi.fn(), onQuickSwitcher: vi.fn() }),
    )
    unmount()
    expect(spy).toHaveBeenCalledWith('keydown', expect.any(Function))
    spy.mockRestore()
  })
})
