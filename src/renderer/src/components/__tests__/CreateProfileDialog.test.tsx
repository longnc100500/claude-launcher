import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import * as matchers from '@testing-library/jest-dom/matchers'
expect.extend(matchers)
import { render, screen, cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'
afterEach(() => cleanup())
import userEvent from '@testing-library/user-event'
import { CreateProfileDialog } from '../CreateProfileDialog'

const defaultProps = {
  isOpen: true,
  isLoading: false,
  error: null,
  onSubmit: vi.fn(),
  onClose: vi.fn(),
}

describe('CreateProfileDialog', () => {
  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <CreateProfileDialog {...defaultProps} isOpen={false} />,
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('renders the dialog when isOpen is true', () => {
    render(<CreateProfileDialog {...defaultProps} />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Create Profile')).toBeInTheDocument()
  })

  it('shows validation error when name is empty on submit', async () => {
    render(<CreateProfileDialog {...defaultProps} />)
    await userEvent.click(screen.getByRole('button', { name: 'Create' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Profile name is required')
    expect(defaultProps.onSubmit).not.toHaveBeenCalled()
  })

  it('calls onSubmit with trimmed name when valid', async () => {
    const onSubmit = vi.fn()
    render(<CreateProfileDialog {...defaultProps} onSubmit={onSubmit} />)
    await userEvent.type(screen.getByLabelText('Profile name'), '  Work  ')
    await userEvent.click(screen.getByRole('button', { name: 'Create' }))
    expect(onSubmit).toHaveBeenCalledWith('Work')
  })

  it('shows server-side error from props', () => {
    render(<CreateProfileDialog {...defaultProps} error="Profile already exists" />)
    expect(screen.getByRole('alert')).toHaveTextContent('Profile already exists')
  })

  it('calls onClose when Cancel is clicked', async () => {
    const onClose = vi.fn()
    render(<CreateProfileDialog {...defaultProps} onClose={onClose} />)
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onClose).toHaveBeenCalled()
  })

  it('shows loading state when isLoading is true', () => {
    render(<CreateProfileDialog {...defaultProps} isLoading={true} />)
    expect(screen.getByRole('button', { name: 'Creating…' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled()
  })

  it('shows validation error for names longer than 64 characters', async () => {
    render(<CreateProfileDialog {...defaultProps} />)
    await userEvent.type(screen.getByLabelText('Profile name'), 'a'.repeat(65))
    await userEvent.click(screen.getByRole('button', { name: 'Create' }))
    expect(screen.getByRole('alert')).toHaveTextContent('64 characters')
  })
})
