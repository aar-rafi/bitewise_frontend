import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { Button } from '../button'

describe('Button Component', () => {
  it('renders with default text', () => {
    render(<Button>Click me</Button>)
    const button = screen.getByText('Click me')
    expect(button).toBeInTheDocument()
  })

  it('calls onClick function when clicked', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()
    
    render(<Button onClick={handleClick}>Click me</Button>)
    const button = screen.getByText('Click me')
    
    await user.click(button)
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('applies correct CSS classes for different variants', () => {
    render(<Button variant="destructive">Delete</Button>)
    const button = screen.getByText('Delete')
    expect(button).toHaveClass('bg-destructive')
  })

  it('applies correct CSS classes for different sizes', () => {
    render(<Button size="sm">Small button</Button>)
    const button = screen.getByText('Small button')
    expect(button).toHaveClass('h-9')
  })

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled button</Button>)
    const button = screen.getByText('Disabled button')
    
    expect(button).toBeDisabled()
    expect(button).toHaveClass('disabled:opacity-50')
  })

  it('does not call onClick when disabled', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()
    
    render(<Button disabled onClick={handleClick}>Disabled button</Button>)
    const button = screen.getByText('Disabled button')
    
    await user.click(button)
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('accepts and applies custom className', () => {
    render(<Button className="my-custom-class">Custom button</Button>)
    const button = screen.getByText('Custom button')
    expect(button).toHaveClass('my-custom-class')
  })
}) 