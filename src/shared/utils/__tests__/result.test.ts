import { describe, it, expect } from 'vitest'
import { mapResult, flatMapResult, matchResult } from '../result'
import { Ok, Err } from '../../types/result'

describe('mapResult', () => {
  it('transforms the value on success', () => {
    const result = mapResult(Ok(5), (n) => n * 2)
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.value).toBe(10)
  })

  it('passes the error through on failure', () => {
    const error = new Error('fail')
    const result = mapResult(Err(error), (n: number) => n * 2)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toBe(error)
  })
})

describe('flatMapResult', () => {
  it('chains results on success', () => {
    const result = flatMapResult(Ok(5), (n) => Ok(n * 2))
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.value).toBe(10)
  })

  it('returns error from inner result on success', () => {
    const error = new Error('inner fail')
    const result = flatMapResult(Ok(5), (_n) => Err(error))
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toBe(error)
  })

  it('short-circuits on failure without calling fn', () => {
    const error = new Error('outer fail')
    let called = false
    const result = flatMapResult(Err(error), (_n: number) => {
      called = true
      return Ok(42)
    })
    expect(called).toBe(false)
    expect(result.ok).toBe(false)
  })
})

describe('matchResult', () => {
  it('calls ok handler on success', () => {
    const result = matchResult(Ok(42), {
      ok: (v) => `value: ${v}`,
      err: () => 'error',
    })
    expect(result).toBe('value: 42')
  })

  it('calls err handler on failure', () => {
    const error = new Error('test error')
    const result = matchResult(Err(error), {
      ok: () => 'ok',
      err: (e) => `error: ${e.message}`,
    })
    expect(result).toBe('error: test error')
  })
})
