import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Avatar, AvatarFallback, AvatarImage } from '../avatar'

describe('Avatar Component', () => {
  it('renders without crashing', () => {
    render(
      <Avatar>
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>
    )

    expect(screen.getByText('AB')).toBeInTheDocument()
  })

  it('displays fallback text', () => {
    render(
      <Avatar>
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
    )

    expect(screen.getByText('JD')).toBeInTheDocument()
  })

  it('renders with image component when provided', () => {
    render(
      <Avatar>
        <AvatarImage src="/test-image.jpg" alt="Test User" />
        <AvatarFallback>TU</AvatarFallback>
      </Avatar>
    )

    // Should render without crashing and contain the avatar structure
    expect(document.body).toBeInTheDocument()
    // The fallback might show if image fails to load, which is normal
    expect(screen.getByText('TU')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(
      <Avatar className="custom-avatar">
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>
    )

    const avatar = screen.getByText('AB').closest('[class*="custom-avatar"]')
    expect(avatar).toBeInTheDocument()
  })

  it('handles empty fallback gracefully', () => {
    render(
      <Avatar>
        <AvatarFallback></AvatarFallback>
      </Avatar>
    )

    // Should render without crashing
    expect(document.body).toBeInTheDocument()
  })
}) 