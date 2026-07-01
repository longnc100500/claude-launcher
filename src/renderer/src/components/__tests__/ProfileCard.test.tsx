import React from 'react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import * as matchers from '@testing-library/jest-dom/matchers'
expect.extend(matchers)
import { render, screen, cleanup } from '@testing-library/react'
afterEach(() => cleanup())

import userEvent from '@testing-library/user-event'
import { ProfileCard } from '../ProfileCard'
import { createProfileId } from '../../../../domain/profile'
import type { Profile } from '../../../../domain/profile'

function makeProfile(overrides: Partial<Profile> = {}): Profile {
  return {
    id: createProfileId('550e8400-e29b-41d4-a716-446655440001'),
    name: 'Work',
    homeDir: '/profiles/work',
    createdAt: new Date('2026-01-01'),
    lastUsedAt: null,
    color: null,
    icon: null,
    ...overrides,
  }
}

const noop = vi.fn()

describe('ProfileCard', () => {
  it('renders the profile name', () => {
    render(
      <ProfileCard
        profile={makeProfile()}
        onLaunch={noop}
        onStop={noop}
        onEdit={noop}
        onDelete={noop}
        onSync={noop}
      />,
    )
    expect(screen.getByText('Work')).toBeInTheDocument()
  })

  it('shows the homeDir path', () => {
    render(
      <ProfileCard
        profile={makeProfile()}
        onLaunch={noop}
        onStop={noop}
        onEdit={noop}
        onDelete={noop}
        onSync={noop}
      />,
    )
    expect(screen.getByText('/profiles/work')).toBeInTheDocument()
  })

  it('shows Launch button when not running', () => {
    render(
      <ProfileCard
        profile={makeProfile()}
        isRunning={false}
        onLaunch={noop}
        onStop={noop}
        onEdit={noop}
        onDelete={noop}
        onSync={noop}
      />,
    )
    expect(screen.getByRole('button', { name: 'Launch' })).toBeInTheDocument()
  })

  it('shows Stop button and Running badge when running', () => {
    render(
      <ProfileCard
        profile={makeProfile()}
        isRunning={true}
        onLaunch={noop}
        onStop={noop}
        onEdit={noop}
        onDelete={noop}
        onSync={noop}
      />,
    )
    expect(screen.getByRole('button', { name: 'Stop' })).toBeInTheDocument()
    expect(screen.getByText('Running')).toBeInTheDocument()
  })

  it('calls onLaunch when Launch is clicked', async () => {
    const onLaunch = vi.fn()
    const profile = makeProfile()
    render(
      <ProfileCard
        profile={profile}
        onLaunch={onLaunch}
        onStop={noop}
        onEdit={noop}
        onDelete={noop}
        onSync={noop}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Launch' }))
    expect(onLaunch).toHaveBeenCalledWith(profile)
  })

  it('calls onDelete when Delete is clicked', async () => {
    const onDelete = vi.fn()
    const profile = makeProfile()
    render(
      <ProfileCard
        profile={profile}
        onLaunch={noop}
        onStop={noop}
        onEdit={noop}
        onDelete={onDelete}
        onSync={noop}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }))
    expect(onDelete).toHaveBeenCalledWith(profile)
  })

  it('renders profile icon when present', () => {
    render(
      <ProfileCard
        profile={makeProfile({ icon: '💼' })}
        onLaunch={noop}
        onStop={noop}
        onEdit={noop}
        onDelete={noop}
        onSync={noop}
      />,
    )
    expect(screen.getByText('💼')).toBeInTheDocument()
  })
})
