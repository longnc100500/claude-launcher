import { describe, it, expect } from 'vitest'
import {
  ProfileIdSchema,
  CreateProfileInputSchema,
  UpdateProfileInputSchema,
  LaunchInputSchema,
  AppSettingsSchema,
} from '../schemas'

describe('ProfileIdSchema', () => {
  it('accepts a valid UUID', () => {
    const result = ProfileIdSchema.safeParse('550e8400-e29b-41d4-a716-446655440000')
    expect(result.success).toBe(true)
  })

  it('rejects an empty string', () => {
    const result = ProfileIdSchema.safeParse('')
    expect(result.success).toBe(false)
  })

  it('rejects a non-UUID string', () => {
    const result = ProfileIdSchema.safeParse('not-a-uuid')
    expect(result.success).toBe(false)
  })
})

describe('CreateProfileInputSchema', () => {
  it('accepts a valid minimal input', () => {
    const result = CreateProfileInputSchema.safeParse({ name: 'Work' })
    expect(result.success).toBe(true)
  })

  it('accepts input with all optional fields', () => {
    const result = CreateProfileInputSchema.safeParse({
      name: 'Work',
      color: '#ff0000',
      icon: '💼',
    })
    expect(result.success).toBe(true)
  })

  it('rejects an empty name', () => {
    const result = CreateProfileInputSchema.safeParse({ name: '' })
    expect(result.success).toBe(false)
  })

  it('rejects a name longer than 64 characters', () => {
    const result = CreateProfileInputSchema.safeParse({ name: 'a'.repeat(65) })
    expect(result.success).toBe(false)
  })

  it('rejects an invalid color format', () => {
    const result = CreateProfileInputSchema.safeParse({ name: 'Work', color: 'red' })
    expect(result.success).toBe(false)
  })

  it('trims whitespace from the name', () => {
    const result = CreateProfileInputSchema.safeParse({ name: '  Work  ' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.name).toBe('Work')
    }
  })

  it('rejects missing name', () => {
    const result = CreateProfileInputSchema.safeParse({})
    expect(result.success).toBe(false)
  })
})

describe('UpdateProfileInputSchema', () => {
  it('accepts an empty object (no updates)', () => {
    const result = UpdateProfileInputSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it('accepts a partial update', () => {
    const result = UpdateProfileInputSchema.safeParse({ name: 'Personal' })
    expect(result.success).toBe(true)
  })

  it('rejects an empty name when provided', () => {
    const result = UpdateProfileInputSchema.safeParse({ name: '' })
    expect(result.success).toBe(false)
  })

  it('accepts a valid color', () => {
    const result = UpdateProfileInputSchema.safeParse({ color: '#aabbcc' })
    expect(result.success).toBe(true)
  })
})

describe('LaunchInputSchema', () => {
  it('accepts a valid profileId', () => {
    const result = LaunchInputSchema.safeParse({
      profileId: '550e8400-e29b-41d4-a716-446655440000',
    })
    expect(result.success).toBe(true)
  })

  it('rejects a missing profileId', () => {
    const result = LaunchInputSchema.safeParse({})
    expect(result.success).toBe(false)
  })
})

describe('AppSettingsSchema', () => {
  it('accepts valid settings', () => {
    const result = AppSettingsSchema.safeParse({
      claudeBinaryPath: '/Applications/Claude.app/Contents/MacOS/Claude',
      dataDir: '/Users/test/.claude-launcher',
      launchOnStartup: false,
    })
    expect(result.success).toBe(true)
  })

  it('accepts null claudeBinaryPath', () => {
    const result = AppSettingsSchema.safeParse({
      claudeBinaryPath: null,
      dataDir: '/Users/test/.claude-launcher',
      launchOnStartup: true,
    })
    expect(result.success).toBe(true)
  })

  it('rejects an empty dataDir', () => {
    const result = AppSettingsSchema.safeParse({
      claudeBinaryPath: null,
      dataDir: '',
      launchOnStartup: false,
    })
    expect(result.success).toBe(false)
  })
})
