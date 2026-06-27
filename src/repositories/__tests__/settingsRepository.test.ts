import { describe, it, expect, beforeEach } from 'vitest'
import { SettingsRepository } from '../settingsRepository'
import { MockStore } from '../../test/mocks/mockStore'

describe('SettingsRepository', () => {
  let store: MockStore
  let repo: SettingsRepository

  beforeEach(() => {
    store = new MockStore()
    repo = new SettingsRepository(store as never)
  })

  describe('get', () => {
    it('returns default settings when store is empty', async () => {
      const settings = await repo.get()
      expect(settings.claudeBinaryPath).toBeNull()
      expect(settings.theme).toBe('system')
      expect(settings.launchOnStartup).toBe(false)
    })
  })

  describe('save and get', () => {
    it('persists and retrieves settings', async () => {
      await repo.save({
        claudeBinaryPath: '/Applications/Claude.app',
        dataDir: '/Users/test/.claude-launcher',
        theme: 'dark',
        launchOnStartup: true,
      })
      const result = await repo.get()
      expect(result.claudeBinaryPath).toBe('/Applications/Claude.app')
      expect(result.theme).toBe('dark')
      expect(result.launchOnStartup).toBe(true)
    })

    it('saves null claudeBinaryPath', async () => {
      await repo.save({
        claudeBinaryPath: null,
        dataDir: '/Users/test/.claude-launcher',
        theme: 'light',
        launchOnStartup: false,
      })
      const result = await repo.get()
      expect(result.claudeBinaryPath).toBeNull()
    })
  })
})
