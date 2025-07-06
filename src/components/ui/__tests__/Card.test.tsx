import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../card'

describe('Card Component', () => {
  it('renders without crashing', () => {
    render(
      <Card>
        <CardContent>Test content</CardContent>
      </Card>
    )

    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  it('renders with header and title', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Test Title</CardTitle>
        </CardHeader>
      </Card>
    )

    expect(screen.getByText('Test Title')).toBeInTheDocument()
  })

  it('renders with description', () => {
    render(
      <Card>
        <CardHeader>
          <CardDescription>Test description</CardDescription>
        </CardHeader>
      </Card>
    )

    expect(screen.getByText('Test description')).toBeInTheDocument()
  })

  it('renders complete card with all sections', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card description</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Main content goes here</p>
        </CardContent>
        <CardFooter>
          <span>Footer content</span>
        </CardFooter>
      </Card>
    )

    expect(screen.getByText('Card Title')).toBeInTheDocument()
    expect(screen.getByText('Card description')).toBeInTheDocument()
    expect(screen.getByText('Main content goes here')).toBeInTheDocument()
    expect(screen.getByText('Footer content')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(
      <Card className="custom-card">
        <CardContent>Content</CardContent>
      </Card>
    )

    const content = screen.getByText('Content')
    const card = content.closest('[class*="custom-card"]')
    expect(card).toBeInTheDocument()
  })

  it('handles empty content gracefully', () => {
    render(
      <Card>
        <CardContent></CardContent>
      </Card>
    )

    // Should render without crashing
    expect(document.body).toBeInTheDocument()
  })
}) 