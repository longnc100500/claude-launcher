import { describe, it, expect } from 'vitest'
import { joinPaths, expandHome, isAbsolutePath } from '../path'

describe('joinPaths', () => {
  it('joins path segments', () => {
    const result = joinPaths('/home', 'user', 'docs')
    expect(result).toBe('/home/user/docs')
  })

  it('handles a single segment', () => {
    const result = joinPaths('/home')
    expect(result).toBe('/home')
  })

  it('normalizes double slashes', () => {
    const result = joinPaths('/home/', '/docs')
    expect(result).toBe('/home/docs')
  })
})

describe('expandHome', () => {
  it('expands ~ to the HOME directory', () => {
    const original = process.env['HOME']
    process.env['HOME'] = '/Users/test'
    const result = expandHome('~/docs')
    expect(result).toBe('/Users/test/docs')
    if (original !== undefined) process.env['HOME'] = original
  })

  it('expands ~ alone to the HOME directory', () => {
    const original = process.env['HOME']
    process.env['HOME'] = '/Users/test'
    const result = expandHome('~')
    expect(result).toBe('/Users/test')
    if (original !== undefined) process.env['HOME'] = original
  })

  it('does not expand a path that does not start with ~', () => {
    const result = expandHome('/absolute/path')
    expect(result).toBe('/absolute/path')
  })

  it('does not expand a path containing ~ in the middle', () => {
    const result = expandHome('/path/with~/tilde')
    expect(result).toBe('/path/with~/tilde')
  })
})

describe('isAbsolutePath', () => {
  it('returns true for an absolute path', () => {
    expect(isAbsolutePath('/Users/test')).toBe(true)
  })

  it('returns false for a relative path', () => {
    expect(isAbsolutePath('relative/path')).toBe(false)
  })

  it('returns false for a path starting with ~', () => {
    expect(isAbsolutePath('~/docs')).toBe(false)
  })
})
