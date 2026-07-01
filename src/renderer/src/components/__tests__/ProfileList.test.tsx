import React from 'react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import * as matchers from '@testing-library/jest-dom/matchers'
expect.extend(matchers)
import { render, screen, cleanup } from '@testing-library/react'
afterEach(() => cleanup())
import { ProfileList } from '../ProfileList'
import { createProfileId } from '../../../../domain/profile'
import type { Profile } from '../../../../domain/profile'

function makeProfile(name = 'Work'): Profile {
  return {
    id: createProfileId('550e8400-e29b-41d4-a716-446655440001'),
    name,
    homeDir: '/profiles/work',
    createdAt: new Date('2026-01-01'),
    lastUsedAt: null,
    color: null,
    icon: null,
  }
}

const noop = vi.fn()
const defaultProps = {
  isLoading: false,
  error: null,
  runningProfileIds: new Set<string>(),
  onLaunch: noop,
  onStop: noop,
  onEdit: noop,
  onDelete: noop,
  onSync: noop,
  onCreateNew: noop,
}

describe('ProfileList', () => {
  it('shows loading skeleton when isLoading is true', () => {
    const { container } = render(
      <ProfileList {...defaultProps} profiles={[]} isLoading={true} />,
    )
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('shows error message when error is set', () => {
    render(
      <ProfileList {...defaultProps} profiles={[]} error="Failed to load" />,
    )
    expect(screen.getByText('Failed to load profiles')).toBeInTheDocument()
    expect(screen.getByText('Failed to load')).toBeInTheDocument()
  })

  it('shows empty state when profiles array is empty', () => {
    render(<ProfileList {...defaultProps} profiles={[]} />)
    expect(screen.getByText(/No profiles yet/)).toBeInTheDocument()
  })

  it('renders profile cards for each profile', () => {
    const profiles = [makeProfile('Work'), makeProfile('Personal')]
    render(<ProfileList {...defaultProps} profiles={profiles} />)
    expect(screen.getByText('Work')).toBeInTheDocument()
    expect(screen.getByText('Personal')).toBeInTheDocument()
  })
})
