import { describe, it, expect, beforeEach } from 'vitest'
import { BinaryDiscoveryService } from '../binaryDiscoveryService'
import { MockFilesystemService } from '../../test/mocks/mockFilesystemService'

describe('BinaryDiscoveryService', () => {
  let fs: MockFilesystemService
  let service: BinaryDiscoveryService

  beforeEach(() => {
    fs = new MockFilesystemService()
    service = new BinaryDiscoveryService(fs)
  })

  describe('discover', () => {
    it('returns error when no known path exists', async () => {
      const result = await service.discover()
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error.code).toBe('BINARY_NOT_FOUND')
      }
    })

    it('returns the first existing path', async () => {
      // Add a file at the first known path for this platform
      const paths = service.getKnownPaths()
      const firstPath = paths[0]
      if (firstPath) {
        fs.addFile(firstPath)
        const result = await service.discover()
        expect(result.ok).toBe(true)
        if (result.ok) {
          expect(result.value).toBe(firstPath)
        }
      }
    })

    it('skips non-existent paths and returns the first found', async () => {
      const paths = service.getKnownPaths()
      // Add only the second path (if it exists)
      const secondPath = paths[1]
      if (secondPath) {
        fs.addFile(secondPath)
        const result = await service.discover()
        expect(result.ok).toBe(true)
        if (result.ok) {
          expect(result.value).toBe(secondPath)
        }
      }
    })
  })

  describe('getKnownPaths', () => {
    it('returns an array (may be empty on unknown platforms)', () => {
      const paths = service.getKnownPaths()
      expect(Array.isArray(paths)).toBe(true)
    })

    it('returns non-empty paths on known platforms', () => {
      // At least darwin and linux should have paths
      const platform = process.platform
      if (['darwin', 'linux', 'win32'].includes(platform)) {
        expect(service.getKnownPaths().length).toBeGreaterThan(0)
      }
    })
  })
})
