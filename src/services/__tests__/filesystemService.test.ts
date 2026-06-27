import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { join } from 'path'
import { tmpdir } from 'os'
import { randomUUID } from 'crypto'
import { FilesystemService } from '../filesystemService'

function tempDir(): string {
  return join(tmpdir(), `claude-launcher-test-${randomUUID()}`)
}

describe('FilesystemService', () => {
  const service = new FilesystemService()
  let testRoot: string

  beforeEach(() => {
    testRoot = tempDir()
  })

  afterEach(async () => {
    await service.rm(testRoot, { recursive: true, force: true })
  })

  describe('exists', () => {
    it('returns false for a path that does not exist', async () => {
      const result = await service.exists(join(testRoot, 'nonexistent'))
      expect(result).toBe(false)
    })

    it('returns true for a directory that exists', async () => {
      await service.mkdir(testRoot, { recursive: true })
      const result = await service.exists(testRoot)
      expect(result).toBe(true)
    })
  })

  describe('mkdir', () => {
    it('creates a directory', async () => {
      await service.mkdir(testRoot, { recursive: true })
      expect(await service.exists(testRoot)).toBe(true)
    })

    it('creates nested directories with recursive option', async () => {
      const nested = join(testRoot, 'a', 'b', 'c')
      await service.mkdir(nested, { recursive: true })
      expect(await service.exists(nested)).toBe(true)
    })
  })

  describe('rm', () => {
    it('removes a directory', async () => {
      await service.mkdir(testRoot, { recursive: true })
      await service.rm(testRoot, { recursive: true })
      expect(await service.exists(testRoot)).toBe(false)
    })

    it('removes a directory tree recursively', async () => {
      const nested = join(testRoot, 'a', 'b')
      await service.mkdir(nested, { recursive: true })
      await service.rm(testRoot, { recursive: true })
      expect(await service.exists(testRoot)).toBe(false)
    })

    it('does not throw with force option when path does not exist', async () => {
      await expect(
        service.rm(join(testRoot, 'nonexistent'), { recursive: true, force: true }),
      ).resolves.toBeUndefined()
    })
  })

  describe('readdir', () => {
    it('returns an empty array for an empty directory', async () => {
      await service.mkdir(testRoot, { recursive: true })
      const result = await service.readdir(testRoot)
      expect(result).toEqual([])
    })

    it('returns directory entries', async () => {
      await service.mkdir(testRoot, { recursive: true })
      await service.mkdir(join(testRoot, 'sub1'), { recursive: true })
      await service.mkdir(join(testRoot, 'sub2'), { recursive: true })
      const result = await service.readdir(testRoot)
      expect(result.sort()).toEqual(['sub1', 'sub2'])
    })
  })
})
