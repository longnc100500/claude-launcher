import React from 'react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as matchers from '@testing-library/jest-dom/matchers'
import { expect as expectJest } from 'vitest'
import { IconPicker } from '../IconPicker'

expectJest.extend(matchers)
afterEach(cleanup)

describe('IconPicker', () => {
  it('renders the no-icon button', () => {
    render(<IconPicker value={null} onChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'No icon' })).toBeInTheDocument()
  })

  it('renders emoji buttons', () => {
    render(<IconPicker value={null} onChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Select icon 💼' })).toBeInTheDocument()
  })

  it('calls onChange with null when no-icon is clicked', async () => {
    const onChange = vi.fn()
    render(<IconPicker value="💼" onChange={onChange} />)
    await userEvent.click(screen.getByRole('button', { name: 'No icon' }))
    expect(onChange).toHaveBeenCalledWith(null)
  })

  it('calls onChange with emoji when an emoji is clicked', async () => {
    const onChange = vi.fn()
    render(<IconPicker value={null} onChange={onChange} />)
    await userEvent.click(screen.getByRole('button', { name: 'Select icon 💼' }))
    expect(onChange).toHaveBeenCalledWith('💼')
  })

  it('marks the selected emoji as pressed', () => {
    render(<IconPicker value="💼" onChange={vi.fn()} />)
    const btn = screen.getByRole('button', { name: 'Select icon 💼' })
    expect(btn).toHaveAttribute('aria-pressed', 'true')
  })
})
