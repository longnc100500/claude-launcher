import React from 'react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import * as matchers from '@testing-library/jest-dom/matchers'
expect.extend(matchers)
import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EditProfileDialog } from '../EditProfileDialog'
import { createProfileId } from '../../../../domain/profile'
import type { Profile } from '../../../../domain/profile'

afterEach(cleanup)

function makeProfile(): Profile {
  return {
    id: createProfileId('550e8400-e29b-41d4-a716-446655440001'),
    name: 'Work',
    homeDir: '/profiles/work',
    createdAt: new Date('2026-01-01'),
    lastUsedAt: null,
    color: null,
    icon: null,
  }
}

describe('EditProfileDialog', () => {
  it('renders nothing when profile is null', () => {
    const { container } = render(
      <EditProfileDialog profile={null} isLoading={false} error={null} onSubmit={vi.fn()} onClose={vi.fn()} />,
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('pre-fills the name from the profile', () => {
    render(
      <EditProfileDialog profile={makeProfile()} isLoading={false} error={null} onSubmit={vi.fn()} onClose={vi.fn()} />,
    )
    const input = screen.getByLabelText('Profile name') as HTMLInputElement
    expect(input.value).toBe('Work')
  })

  it('calls onSubmit with the updated name', async () => {
    const onSubmit = vi.fn()
    render(
      <EditProfileDialog profile={makeProfile()} isLoading={false} error={null} onSubmit={onSubmit} onClose={vi.fn()} />,
    )
    const input = screen.getByLabelText('Profile name')
    await userEvent.clear(input)
    await userEvent.type(input, 'Personal')
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(onSubmit).toHaveBeenCalledWith('Personal', null)
  })

  it('shows validation error for empty name', async () => {
    render(
      <EditProfileDialog profile={makeProfile()} isLoading={false} error={null} onSubmit={vi.fn()} onClose={vi.fn()} />,
    )
    await userEvent.clear(screen.getByLabelText('Profile name'))
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })
})
