import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Label } from '../label'

describe('Label Component', () => {
  it('renders with text content', () => {
    render(<Label>Username</Label>)
    const label = screen.getByText('Username')
    expect(label).toBeInTheDocument()
  })

  it('applies htmlFor attribute correctly', () => {
    render(<Label htmlFor="username">Username</Label>)
    const label = screen.getByText('Username')
    expect(label).toHaveAttribute('for', 'username')
  })

  it('associates with form inputs', () => {
    render(
      <div>
        <Label htmlFor="test-input">Test Label</Label>
        <input id="test-input" type="text" />
      </div>
    )
    
    const label = screen.getByText('Test Label')
    const input = screen.getByLabelText('Test Label')
    
    expect(label).toBeInTheDocument()
    expect(input).toBeInTheDocument()
    expect(input).toHaveAttribute('id', 'test-input')
  })

  it('applies custom className', () => {
    render(<Label className="custom-label">Custom Label</Label>)
    const label = screen.getByText('Custom Label')
    expect(label).toHaveClass('custom-label')
  })

  it('applies default styling classes', () => {
    render(<Label>Styled Label</Label>)
    const label = screen.getByText('Styled Label')
    expect(label).toHaveClass('text-sm', 'font-medium', 'leading-none')
  })

  it('supports children elements', () => {
    render(
      <Label>
        <span>Required</span> Field
      </Label>
    )
    
    expect(screen.getByText('Required')).toBeInTheDocument()
    expect(screen.getByText('Field')).toBeInTheDocument()
  })
}) 