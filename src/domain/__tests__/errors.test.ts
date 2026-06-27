import { describe, it, expect } from 'vitest'
import {
  ProfileNotFoundError,
  ProfileAlreadyExistsError,
  ProfileValidationError,
  BinaryNotFoundError,
  ProcessAlreadyRunningError,
  ProcessStartFailedError,
  StorageError,
} from '../errors'

describe('Domain errors', () => {
  describe('ProfileNotFoundError', () => {
    it('sets the correct code', () => {
      const err = new ProfileNotFoundError('id-123')
      expect(err.code).toBe('PROFILE_NOT_FOUND')
    })

    it('includes the profile id in the message', () => {
      const err = new ProfileNotFoundError('id-123')
      expect(err.message).toContain('id-123')
    })

    it('is an instance of Error', () => {
      const err = new ProfileNotFoundError('id-123')
      expect(err).toBeInstanceOf(Error)
    })
  })

  describe('ProfileAlreadyExistsError', () => {
    it('sets the correct code', () => {
      const err = new ProfileAlreadyExistsError('Work')
      expect(err.code).toBe('PROFILE_ALREADY_EXISTS')
    })

    it('includes the profile name in the message', () => {
      const err = new ProfileAlreadyExistsError('Work')
      expect(err.message).toContain('Work')
    })
  })

  describe('ProfileValidationError', () => {
    it('sets the correct code', () => {
      const err = new ProfileValidationError('Name is required')
      expect(err.code).toBe('PROFILE_VALIDATION_ERROR')
    })

    it('includes the reason in the message', () => {
      const err = new ProfileValidationError('Name is required')
      expect(err.message).toContain('Name is required')
    })
  })

  describe('BinaryNotFoundError', () => {
    it('sets the correct code', () => {
      const err = new BinaryNotFoundError('/Applications/Claude.app')
      expect(err.code).toBe('BINARY_NOT_FOUND')
    })

    it('includes the path in the message', () => {
      const err = new BinaryNotFoundError('/Applications/Claude.app')
      expect(err.message).toContain('/Applications/Claude.app')
    })
  })

  describe('ProcessAlreadyRunningError', () => {
    it('sets the correct code', () => {
      const err = new ProcessAlreadyRunningError('profile-1')
      expect(err.code).toBe('PROCESS_ALREADY_RUNNING')
    })
  })

  describe('ProcessStartFailedError', () => {
    it('sets the correct code', () => {
      const err = new ProcessStartFailedError('profile-1', 'binary not executable')
      expect(err.code).toBe('PROCESS_START_FAILED')
    })

    it('includes both profileId and reason in the message', () => {
      const err = new ProcessStartFailedError('profile-1', 'binary not executable')
      expect(err.message).toContain('profile-1')
      expect(err.message).toContain('binary not executable')
    })
  })

  describe('StorageError', () => {
    it('sets the correct code', () => {
      const err = new StorageError('disk full')
      expect(err.code).toBe('STORAGE_ERROR')
    })
  })
})
