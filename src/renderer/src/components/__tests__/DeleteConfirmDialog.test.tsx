import React from 'react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import * as matchers from '@testing-library/jest-dom/matchers'
expect.extend(matchers)
import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DeleteConfirmDialog } from '../DeleteConfirmDialog'
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

describe('DeleteConfirmDialog', () => {
  it('renders nothing when profile is null', () => {
    const { container } = render(
      <DeleteConfirmDialog profile={null} isLoading={false} onConfirm={vi.fn()} onClose={vi.fn()} />,
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('shows the profile name', () => {
    render(
      <DeleteConfirmDialog profile={makeProfile()} isLoading={false} onConfirm={vi.fn()} onClose={vi.fn()} />,
    )
    expect(screen.getByText(/Work/)).toBeInTheDocument()
  })

  it('calls onConfirm when Delete is clicked', async () => {
    const onConfirm = vi.fn()
    render(
      <DeleteConfirmDialog profile={makeProfile()} isLoading={false} onConfirm={onConfirm} onClose={vi.fn()} />,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }))
    expect(onConfirm).toHaveBeenCalled()
  })

  it('calls onClose when Cancel is clicked', async () => {
    const onClose = vi.fn()
    render(
      <DeleteConfirmDialog profile={makeProfile()} isLoading={false} onConfirm={vi.fn()} onClose={onClose} />,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onClose).toHaveBeenCalled()
  })
})
