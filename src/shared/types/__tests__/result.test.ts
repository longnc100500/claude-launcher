import { describe, it, expect } from 'vitest'
import { Ok, Err } from '../result'

describe('Result', () => {
  describe('Ok', () => {
    it('creates a success result with the given value', () => {
      const result = Ok(42)
      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value).toBe(42)
      }
    })

    it('works with string values', () => {
      const result = Ok('hello')
      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value).toBe('hello')
      }
    })

    it('works with object values', () => {
      const obj = { id: '1', name: 'test' }
      const result = Ok(obj)
      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value).toEqual(obj)
      }
    })

    it('works with null', () => {
      const result = Ok(null)
      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value).toBeNull()
      }
    })
  })

  describe('Err', () => {
    it('creates a failure result with the given error', () => {
      const error = new Error('something went wrong')
      const result = Err(error)
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toBe(error)
      }
    })

    it('preserves the error message', () => {
      const error = new Error('specific message')
      const result = Err(error)
      if (!result.ok) {
        expect(result.error.message).toBe('specific message')
      }
    })
  })
})
