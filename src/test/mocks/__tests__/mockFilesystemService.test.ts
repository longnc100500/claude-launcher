import { describe, it, expect, beforeEach } from 'vitest'
import { MockFilesystemService } from '../mockFilesystemService'

describe('MockFilesystemService', () => {
  let mock: MockFilesystemService

  beforeEach(() => {
    mock = new MockFilesystemService()
  })

  describe('exists', () => {
    it('returns false for non-existent path', async () => {
      expect(await mock.exists('/some/path')).toBe(false)
    })

    it('returns true for a directory added via addDirectory', async () => {
      mock.addDirectory('/some/path')
      expect(await mock.exists('/some/path')).toBe(true)
    })

    it('returns true for a file added via addFile', async () => {
      mock.addFile('/some/file.txt')
      expect(await mock.exists('/some/file.txt')).toBe(true)
    })
  })

  describe('mkdir', () => {
    it('creates a directory', async () => {
      await mock.mkdir('/new/dir')
      expect(await mock.exists('/new/dir')).toBe(true)
    })
  })

  describe('rm', () => {
    it('removes a directory', async () => {
      mock.addDirectory('/dir')
      await mock.rm('/dir')
      expect(await mock.exists('/dir')).toBe(false)
    })

    it('removes a directory and its children with recursive option', async () => {
      mock.addDirectory('/parent')
      mock.addDirectory('/parent/child')
      mock.addDirectory('/parent/child/grandchild')
      await mock.rm('/parent', { recursive: true })
      expect(await mock.exists('/parent')).toBe(false)
      expect(await mock.exists('/parent/child')).toBe(false)
      expect(await mock.exists('/parent/child/grandchild')).toBe(false)
    })
  })

  describe('readdir', () => {
    it('returns empty array when directory has no children', async () => {
      mock.addDirectory('/empty')
      const result = await mock.readdir('/empty')
      expect(result).toEqual([])
    })

    it('returns direct children only', async () => {
      mock.addDirectory('/parent/child1')
      mock.addDirectory('/parent/child2')
      mock.addDirectory('/parent/child1/grandchild')
      const result = await mock.readdir('/parent')
      expect([...result].sort()).toEqual(['child1', 'child2'])
    })
  })

  describe('reset', () => {
    it('clears all directories and files', async () => {
      mock.addDirectory('/dir')
      mock.addFile('/file.txt')
      mock.reset()
      expect(await mock.exists('/dir')).toBe(false)
      expect(await mock.exists('/file.txt')).toBe(false)
    })
  })
})
