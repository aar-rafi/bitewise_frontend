import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { Checkbox } from '../checkbox'

describe('Checkbox Component', () => {
  it('renders correctly', () => {
    render(<Checkbox />)
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toBeInTheDocument()
  })

  it('can be checked and unchecked', async () => {
    const user = userEvent.setup()
    render(<Checkbox />)
    
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).not.toBeChecked()
    
    await user.click(checkbox)
    expect(checkbox).toBeChecked()
    
    await user.click(checkbox)
    expect(checkbox).not.toBeChecked()
  })

  it('calls onCheckedChange when clicked', async () => {
    const handleChange = vi.fn()
    const user = userEvent.setup()
    
    render(<Checkbox onCheckedChange={handleChange} />)
    const checkbox = screen.getByRole('checkbox')
    
    await user.click(checkbox)
    expect(handleChange).toHaveBeenCalledWith(true)
  })

  it('is disabled when disabled prop is true', () => {
    render(<Checkbox disabled />)
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toBeDisabled()
  })

  it('cannot be clicked when disabled', async () => {
    const handleChange = vi.fn()
    const user = userEvent.setup()
    
    render(<Checkbox disabled onCheckedChange={handleChange} />)
    const checkbox = screen.getByRole('checkbox')
    
    await user.click(checkbox)
    expect(handleChange).not.toHaveBeenCalled()
  })

  it('applies custom className', () => {
    render(<Checkbox className="custom-checkbox" />)
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toHaveClass('custom-checkbox')
  })

  it('can be controlled with checked prop', () => {
    render(<Checkbox checked={true} />)
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toBeChecked()
  })
}) 